import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException
} from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { DataSource, Repository } from 'typeorm'
import { ApplicationStatus, ProjectApplication } from './project-application.entity'
import { Project, ProjectStatus } from '../project/project.entity'
import { ProjectMember, MemberType } from '../project-member/project-member.entity'
import { User } from '../user/entities/user.entity'
import { ProjectEventPublisher } from '../event-emitter/project-event/project-event.publisher'
import { ProjectEventType } from '../event-emitter/project-event/types/event.types'
import { GetApplicationsReqDto } from './dto/req/get-applications.req.dto'
import { PostProjectApplicationReqDto } from './dto/req/post-application.req.dto'
import { PatchProjectApplicationRejectReqDto } from './dto/req/patch-application-reject.req.dto'
import { IdParamsDto } from '@data/dto'
import { GetProjectApplicationsResDto } from './dto/res/get-applications.res.dto'

@Injectable()
export class ProjectApplicationService {
  constructor(
    private dataSource: DataSource,
    @InjectRepository(ProjectApplication)
    private applicationRepository: Repository<ProjectApplication>,
    @InjectRepository(Project)
    private projectRepository: Repository<Project>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private eventPublisher: ProjectEventPublisher
  ) {}

  async apply(projectId: number, userId: number, data: PostProjectApplicationReqDto): Promise<IdParamsDto> {
    const { position, motivation } = data

    const [project, user] = await Promise.all([
      this.projectRepository.findOne({ where: { id: projectId } }),
      this.userRepository.findOne({ where: { id: userId } })
    ])
    if (!project) throw new NotFoundException('not_found_project_info')
    if (!user) throw new NotFoundException('not_found_user_info')

    if (project.hostId === userId) throw new ForbiddenException('host_cannot_apply')

    if (project.status === ProjectStatus.recruitment_closed) throw new BadRequestException('recruitment_closed')

    const existing = await this.applicationRepository.findOne({ where: { projectId, userId } })
    if (existing) throw new ConflictException('already_applied')

    const application = new ProjectApplication({ position, motivation, projectId, userId })
    try {
      await this.applicationRepository.save(application)
    } catch (e) {
      if (e?.code === '23505') throw new ConflictException('duplicate')
      throw e
    }

    this.eventPublisher.publish({
      type: ProjectEventType.APPLICATION_SENT,
      metadata: {
        applicationId: application.id,
        projectId: project.id,
        projectTitle: project.title,
        hostId: project.hostId,
        applicantUserId: userId,
        applicantName: user.nickname
      }
    })

    return { id: application.id }
  }

  async findAllByProject(
    projectId: number,
    hostUserId: number,
    options: GetApplicationsReqDto
  ): Promise<GetProjectApplicationsResDto> {
    const { status, sort, order, start, perPage } = options

    const project = await this.projectRepository.findOne({ where: { id: projectId } })
    if (!project) throw new NotFoundException('not_found_project_info')
    if (project.hostId !== hostUserId) throw new ForbiddenException('forbidden_not_host')

    const query = this.applicationRepository
      .createQueryBuilder('application')
      .leftJoinAndSelect('application.user', 'u')
      .where('application.projectId = :projectId', { projectId })

    if (status) query.andWhere('application.status = :status', { status })

    if (sort && order) {
      query.orderBy(`application.${sort}`, order as 'ASC' | 'DESC')
    } else {
      query.orderBy('application.createdAt', 'DESC')
    }

    const [entities, total] = await query.skip(start).take(perPage).getManyAndCount()

    const data = entities.map((a) => ({
      id: a.id,
      userId: a.userId,
      position: a.position,
      motivation: a.motivation,
      status: a.status,
      rejectionType: a.rejectionType,
      rejectionText: a.rejectionText,
      createdAt: a.createdAt,
      user: {
        id: a.user?.id,
        nickname: a.user?.nickname,
        profileImageUrl: a.user?.profileImageUrl ?? null
      }
    }))

    return { data, total }
  }

  async approve(applicationId: number, hostUserId: number): Promise<void> {
    const { application, project } = await this.getApplicationWithProjectGuard(applicationId, hostUserId)
    const user = await this.userRepository.findOne({ where: { id: application.userId } })

    const queryRunner = this.dataSource.createQueryRunner()
    await queryRunner.connect()
    await queryRunner.startTransaction()

    try {
      // 동시 approve 요청 직렬화를 위해 project 행 락
      const lockedProject = await queryRunner.manager.findOne(Project, {
        where: { id: project.id },
        lock: { mode: 'pessimistic_write' }
      })

      const currentMemberCount = await queryRunner.manager.count(ProjectMember, {
        where: { projectId: application.projectId }
      })

      if (currentMemberCount >= lockedProject.maxMembers) {
        if (lockedProject.status === ProjectStatus.recruiting) {
          await queryRunner.manager.update(
            Project,
            { id: lockedProject.id },
            { status: ProjectStatus.recruitment_closed }
          )
        }
        throw new BadRequestException('project_full')
      }

      await queryRunner.manager.update(
        ProjectApplication,
        { id: application.id },
        { status: ApplicationStatus.approved }
      )

      await queryRunner.manager.save(
        ProjectMember,
        new ProjectMember({
          projectId: application.projectId,
          userId: application.userId,
          memberType: MemberType.MEMBER,
          position: application.position
        })
      )

      if (lockedProject.status === ProjectStatus.recruiting && currentMemberCount + 1 >= lockedProject.maxMembers) {
        await queryRunner.manager.update(
          Project,
          { id: lockedProject.id },
          { status: ProjectStatus.recruitment_closed }
        )
      }

      await queryRunner.commitTransaction()
    } catch (e) {
      await queryRunner.rollbackTransaction()
      throw e
    } finally {
      await queryRunner.release()
    }

    this.eventPublisher.publish({
      type: ProjectEventType.APPLICATION_RESPONDED,
      metadata: {
        applicationId: application.id,
        projectId: project.id,
        projectTitle: project.title,
        applicantUserId: application.userId,
        applicantName: user?.nickname ?? '',
        hostUserId,
        status: 'APPROVED'
      }
    })
  }

  async reject(applicationId: number, hostUserId: number, data: PatchProjectApplicationRejectReqDto): Promise<void> {
    const { rejectionType, rejectionText } = data
    const { application, project } = await this.getApplicationWithProjectGuard(applicationId, hostUserId)
    const user = await this.userRepository.findOne({ where: { id: application.userId } })

    application.status = ApplicationStatus.rejected
    application.rejectionType = rejectionType
    application.rejectionText = rejectionText
    await this.applicationRepository.save(application)

    this.eventPublisher.publish({
      type: ProjectEventType.APPLICATION_RESPONDED,
      metadata: {
        applicationId: application.id,
        projectId: project.id,
        projectTitle: project.title,
        applicantUserId: application.userId,
        applicantName: user?.nickname ?? '',
        hostUserId,
        status: 'REJECTED'
      }
    })
  }

  private async getApplicationWithProjectGuard(applicationId: number, hostUserId: number) {
    const application = await this.applicationRepository.findOne({ where: { id: applicationId } })
    if (!application) throw new NotFoundException('not_found_application_info')

    const project = await this.projectRepository.findOne({ where: { id: application.projectId } })
    if (!project) throw new NotFoundException('not_found_project_info')
    if (project.hostId !== hostUserId) throw new ForbiddenException('forbidden_not_host')
    if (application.status !== ApplicationStatus.pending) throw new ConflictException('already_processed')

    return { application, project }
  }
}
