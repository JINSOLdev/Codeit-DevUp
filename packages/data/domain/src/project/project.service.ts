import { CACHE_MANAGER } from '@nestjs/cache-manager'
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException
} from '@nestjs/common'
import type { Cache } from 'cache-manager'
import { InjectRepository } from '@nestjs/typeorm'
import { In, Repository } from 'typeorm'
import { Project, ProjectStatus } from './project.entity'
import { ProjectMember, MemberType } from '../project-member/project-member.entity'
import { ProjectLiked } from '../project-liked/project-liked.entity'
import { User } from '../user/entities/user.entity'
import { ApplicationStatus, ProjectApplication } from '../project-applications/project-application.entity'
import { ProjectEventPublisher } from '../event-emitter/project-event/project-event.publisher'
import { ProjectEventType } from '../event-emitter/project-event/types/event.types'
import { PostProjectReqDto } from './dto/req/post-project.req.dto'
import { PatchProjectReqDto } from './dto/req/patch-project.req.dto'
import { GetProjectsReqDto, UserApplicationStatusFilter } from './dto/req/get-projects.req.dto'
import { GetProjectResDto } from './dto/res/get-project.res.dto'
import { GetProjectsResDto } from './dto/res/get-projects.res.dto'
import { IdParamsDto } from '@data/dto'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'

dayjs.extend(utc)
dayjs.extend(timezone)

@Injectable()
export class ProjectService {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    @InjectRepository(Project)
    private projectRepository: Repository<Project>,
    @InjectRepository(ProjectMember)
    private memberRepository: Repository<ProjectMember>,
    @InjectRepository(ProjectLiked)
    private likedRepository: Repository<ProjectLiked>,
    @InjectRepository(ProjectApplication)
    private applicationRepository: Repository<ProjectApplication>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private eventPublisher: ProjectEventPublisher
  ) {}

  async create(hostId: number, data: PostProjectReqDto): Promise<IdParamsDto> {
    const host = await this.userRepository.findOne({ where: { id: hostId } })
    if (!host) throw new NotFoundException('not_found_user_info')

    const project = new Project({ hostId, ...data, status: ProjectStatus.recruiting, viewCount: 0 })
    try {
      await this.projectRepository.save(project)
    } catch (e) {
      if (e?.code === '23505') throw new ConflictException('duplicate')
      throw e
    }

    const hostMember = new ProjectMember({
      projectId: project.id,
      userId: hostId,
      memberType: MemberType.HOST,
      position: host.jobLabel ?? undefined
    })
    await this.memberRepository.save(hostMember)

    return { id: project.id }
  }

  async findAll(data: GetProjectsReqDto, userId?: number): Promise<GetProjectsResDto> {
    const {
      search,
      techStacks,
      positions,
      projectType,
      status,
      minMembers,
      maxMembers,
      sort,
      order,
      start,
      perPage,
      isMember,
      isHost,
      applicationStatus
    } = data

    const query = this.projectRepository
      .createQueryBuilder('p')
      .leftJoinAndSelect('p.host', 'u')
      .addSelect(
        '(SELECT COUNT(*) FROM "ProjectComment" pc WHERE pc."projectId" = p.id AND pc."deletedAt" IS NULL)',
        'commentCount'
      )
      .addSelect('(SELECT COUNT(*) FROM "ProjectMember" pm WHERE pm."projectId" = p.id)', 'currentMembers')

    if (search) {
      const keyword = `%${search}%`
      query.andWhere(
        `(p.title ILIKE :keyword
          OR EXISTS (SELECT 1 FROM unnest(p."techStacks") AS t WHERE t ILIKE :keyword)
          OR EXISTS (SELECT 1 FROM unnest(p."positions") AS pos WHERE pos ILIKE :keyword))`,
        { keyword }
      )
    }

    if (status) query.andWhere('p.status = :status', { status })
    if (projectType) query.andWhere('p."projectType" = :projectType', { projectType })
    if (techStacks?.length) query.andWhere('p."techStacks" && ARRAY[:...techStacks]::text[]', { techStacks })
    if (positions?.length) query.andWhere('p."positions" && ARRAY[:...positions]::text[]', { positions })
    if (minMembers != null) query.andWhere('p."maxMembers" >= :minMembers', { minMembers })
    if (maxMembers != null) query.andWhere('p."maxMembers" <= :maxMembers', { maxMembers })

    if (isMember && userId) {
      query.andWhere(
        `EXISTS (SELECT 1 FROM "ProjectMember" pm WHERE pm."projectId" = p.id AND pm."userId" = :userId AND pm."memberType" = :memberType)`,
        { userId, memberType: MemberType.MEMBER }
      )
    }
    if (isHost && userId) {
      query.andWhere(
        `EXISTS (SELECT 1 FROM "ProjectMember" pm WHERE pm."projectId" = p.id AND pm."userId" = :userId AND pm."memberType" = :hostType)`,
        { userId, hostType: MemberType.HOST }
      )
    }
    const applicationStatusMapByFilter: Record<UserApplicationStatusFilter, ApplicationStatus> = {
      pending: ApplicationStatus.pending,
      approved: ApplicationStatus.approved,
      rejected: ApplicationStatus.rejected
    }
    const mappedApplicationStatus = applicationStatus ? applicationStatusMapByFilter[applicationStatus] : undefined

    if (mappedApplicationStatus && userId) {
      query.andWhere(
        `EXISTS (SELECT 1 FROM "ProjectApplication" pa WHERE pa."projectId" = p.id AND pa."userId" = :userId AND pa."status" = :applicationStatus)`,
        { userId, applicationStatus: mappedApplicationStatus }
      )
    }

    const resolvedOrder = (order ?? 'DESC') as 'ASC' | 'DESC'
    if (sort) {
      query.orderBy(`p.${sort}`, resolvedOrder)
    } else {
      query.orderBy('p.createdAt', 'DESC')
    }

    const total = await query.getCount()
    const { entities, raw } = await query.skip(start).take(perPage).getRawAndEntities()

    let likedProjectIds = new Set<number>()
    if (userId) {
      const likes = await this.likedRepository.findBy({ userId })
      likedProjectIds = new Set(likes.map((l) => l.projectId))
    }

    let membershipMap = new Map<number, MemberType>()
    if (userId && entities.length > 0) {
      const memberships = await this.memberRepository.find({
        where: { projectId: In(entities.map((p) => p.id)), userId },
        select: ['projectId', 'memberType']
      })
      membershipMap = new Map(memberships.map((m) => [m.projectId, m.memberType]))
    }

    let applicationMap = new Map<
      number,
      {
        id: number
        status: ApplicationStatus
        rejectionType: ProjectApplication['rejectionType'] | null
        rejectionText: string | null
      }
    >()
    if (userId && entities.length > 0) {
      const applications = await this.applicationRepository.find({
        where: { projectId: In(entities.map((p) => p.id)), userId },
        select: ['id', 'projectId', 'status', 'rejectionType', 'rejectionText']
      })
      applicationMap = new Map(
        applications.map((application) => [
          application.projectId,
          {
            id: application.id,
            status: application.status,
            rejectionType: application.rejectionType ?? null,
            rejectionText: application.rejectionText ?? null
          }
        ])
      )
    }

    const items: GetProjectResDto[] = entities.map((p, i) => {
      const application = userId ? (applicationMap.get(p.id) ?? null) : null
      const applicationStatus = application?.status ?? null

      return {
        id: p.id,
        title: p.title,
        description: p.description,
        projectType: p.projectType,
        techStacks: p.techStacks,
        positions: p.positions,
        maxMembers: p.maxMembers,
        currentMembers: Number(raw[i]?.currentMembers ?? 0),
        recruitEndDate: p.recruitEndDate,
        projectStartDate: p.projectStartDate,
        projectEndDate: p.projectEndDate,
        contactMethod: p.contactMethod,
        contactLink: p.contactLink,
        status: p.status,
        viewCount: p.viewCount,
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
        commentCount: Number(raw[i]?.commentCount ?? 0),
        liked: userId ? likedProjectIds.has(p.id) : false,
        hasApplication: application != null,
        applicationStatus,
        application,
        isMember: userId ? membershipMap.get(p.id) === MemberType.MEMBER : false,
        isHost: userId ? membershipMap.get(p.id) === MemberType.HOST : false,
        host: {
          id: p.host?.id,
          nickname: p.host?.nickname,
          jobLabel: p.host?.jobLabel ?? null,
          profileImageUrl: p.host?.profileImageUrl ?? null,
          skills: p.host?.skills ?? []
        }
      }
    })

    return { data: items, total }
  }

  async findOne(projectId: number, userId?: number, ip?: string): Promise<GetProjectResDto> {
    const [project, commentRaw, applicationCount, membership, application] = await Promise.all([
      this.projectRepository
        .createQueryBuilder('p')
        .leftJoinAndSelect('p.host', 'u')
        .where('p.id = :projectId', { projectId })
        .getOne(),
      this.projectRepository
        .createQueryBuilder('p')
        .select('COUNT(c.id)', 'count')
        .leftJoin('p.comments', 'c', 'c."deletedAt" IS NULL')
        .where('p.id = :projectId', { projectId })
        .getRawOne<{ count: string }>(),
      this.memberRepository.countBy({ projectId }),
      userId ? this.memberRepository.findOne({ where: { projectId, userId } }) : Promise.resolve(null),
      userId ? this.applicationRepository.findOne({ where: { projectId, userId } }) : Promise.resolve(null)
    ])

    if (!project) throw new NotFoundException('not_found_project_info')

    const viewKey = userId ? `view:project:${projectId}:user:${userId}` : `view:project:${projectId}:ip:${ip}`

    const alreadyViewed = await this.cacheManager.get(viewKey)
    if (!alreadyViewed) {
      await this.projectRepository.increment({ id: projectId }, 'viewCount', 1)
      await this.cacheManager.set(viewKey, 1, 86400000)
    }

    const liked = userId ? await this.likedRepository.existsBy({ projectId, userId }) : false
    const applicationData = userId
      ? application
        ? {
            id: application.id,
            status: application.status,
            rejectionType: application.rejectionType ?? null,
            rejectionText: application.rejectionText ?? null
          }
        : null
      : null

    return {
      id: project.id,
      title: project.title,
      description: project.description,
      projectType: project.projectType,
      techStacks: project.techStacks,
      positions: project.positions,
      maxMembers: project.maxMembers,
      currentMembers: applicationCount,
      recruitEndDate: project.recruitEndDate,
      projectStartDate: project.projectStartDate,
      projectEndDate: project.projectEndDate,
      contactMethod: project.contactMethod,
      contactLink: project.contactLink,
      status: project.status,
      viewCount: project.viewCount,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
      commentCount: Number(commentRaw?.count ?? 0),
      liked,
      hasApplication: applicationData != null,
      applicationStatus: applicationData?.status ?? null,
      application: applicationData,
      isMember: membership?.memberType === MemberType.MEMBER,
      isHost: membership?.memberType === MemberType.HOST,
      host: {
        id: project.host?.id,
        nickname: project.host?.nickname,
        jobLabel: project.host?.jobLabel ?? null,
        profileImageUrl: project.host?.profileImageUrl ?? null,
        skills: project.host?.skills ?? []
      }
    }
  }

  async update(projectId: number, userId: number, data: PatchProjectReqDto): Promise<void> {
    const project = await this.projectRepository.findOne({ where: { id: projectId } })
    if (!project) throw new NotFoundException('not_found_project_info')
    if (project.hostId !== userId) throw new ForbiddenException('forbidden_not_host')

    const nextRecruitEndDate = data.recruitEndDate ?? project.recruitEndDate
    const nextStatus = data.status ?? project.status
    const today = dayjs().tz('Asia/Seoul').format('YYYY-MM-DD')

    if (nextStatus === ProjectStatus.recruiting && nextRecruitEndDate < today) {
      throw new BadRequestException('recruiting: recruitEndDate must be today or later.')
    }

    if (nextStatus === ProjectStatus.recruitment_closed && nextRecruitEndDate >= today) {
      throw new BadRequestException('recruitment_closed: recruitEndDate must be before today.')
    }

    Object.assign(project, data)
    await this.projectRepository.save(project)
  }

  async delete(projectId: number, userId: number): Promise<void> {
    const project = await this.projectRepository.findOne({ where: { id: projectId } })
    if (!project) throw new NotFoundException('not_found_project_info')
    if (project.hostId !== userId) throw new ForbiddenException('forbidden_not_host')

    const recipientIds = await this.getProjectCancelRecipients(project.id)
    this.eventPublisher.publish({
      type: ProjectEventType.MEETING_CANCELED,
      metadata: {
        projectId: project.id,
        projectTitle: project.title,
        recipientIds
      }
    })

    await this.projectRepository.delete({ id: projectId })
  }

  async updateExpiredProjectStatuses(): Promise<number> {
    const today = dayjs().tz('Asia/Seoul').format('YYYY-MM-DD')

    const recruitmentClosedResult = await this.projectRepository
      .createQueryBuilder()
      .update(Project)
      .set({ status: ProjectStatus.recruitment_closed })
      .where('status = :status', { status: ProjectStatus.recruiting })
      .andWhere('"recruitEndDate" < :today', { today })
      .execute()

    return recruitmentClosedResult.affected ?? 0
  }

  private async getProjectCancelRecipients(projectId: number): Promise<number[]> {
    const [members, applications] = await Promise.all([
      this.memberRepository.find({ where: { projectId }, select: ['userId'] }),
      this.applicationRepository.find({ where: { projectId }, select: ['userId'] })
    ])

    return Array.from(
      new Set([...members.map((member) => member.userId), ...applications.map((application) => application.userId)])
    )
  }
}
