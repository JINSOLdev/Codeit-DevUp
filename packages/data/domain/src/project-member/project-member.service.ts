import { ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { MemberType, ProjectMember } from './project-member.entity'
import { Project } from '../project/project.entity'
import { IdParamsDto } from '@data/dto'
import { GetMembersReqDto } from './dto/req/get-members.req.dto'
import { GetMembersResDto } from './dto/res/get-members.res.dto'

@Injectable()
export class ProjectMemberService {
  constructor(
    @InjectRepository(ProjectMember)
    private memberRepository: Repository<ProjectMember>,
    @InjectRepository(Project)
    private projectRepository: Repository<Project>
  ) {}

  async addMember(projectId: number, userId: number, memberType: MemberType, position?: string): Promise<IdParamsDto> {
    const existing = await this.memberRepository.findOne({ where: { projectId, userId } })
    if (existing) throw new ConflictException('already_member')

    const member = new ProjectMember({ projectId, userId, memberType, position })
    try {
      await this.memberRepository.save(member)
    } catch (e) {
      if (e?.code === '23505') throw new ConflictException('duplicate')
      throw e
    }
    return { id: member.id }
  }

  async findAllByProject(projectId: number, options: GetMembersReqDto): Promise<GetMembersResDto> {
    const { sort, order, start, perPage } = options

    const projectExists = await this.projectRepository.existsBy({ id: projectId })
    if (!projectExists) throw new NotFoundException('not_found_project_info')

    const query = this.memberRepository
      .createQueryBuilder('m')
      .leftJoinAndSelect('m.user', 'u')
      .where('m."projectId" = :projectId', { projectId })

    if (sort && order) {
      query.orderBy('m.joinedAt', order as 'ASC' | 'DESC')
    } else {
      query.orderBy('m.joinedAt', 'ASC')
    }

    const [members, total] = await query.skip(start).take(perPage).getManyAndCount()

    const data = members.map((m) => ({
      id: m.id,
      userId: m.userId,
      memberType: m.memberType,
      position: m.position ?? null,
      joinedAt: m.joinedAt,
      user: {
        id: m.user?.id,
        nickname: m.user?.nickname,
        jobLabel: m.user?.jobLabel ?? null,
        profileImageUrl: m.user?.profileImageUrl ?? null,
        skills: m.user?.skills ?? []
      }
    }))

    return { data, total }
  }

  async removeMember(projectId: number, targetUserId: number, hostUserId: number): Promise<void> {
    const project = await this.projectRepository.findOne({ where: { id: projectId } })
    if (!project) throw new NotFoundException('not_found_project_info')
    if (project.hostId !== hostUserId) throw new ForbiddenException('forbidden_not_host')

    const member = await this.memberRepository.findOne({ where: { projectId, userId: targetUserId } })
    if (!member) throw new NotFoundException('not_found_member_info')

    await this.memberRepository.delete({ id: member.id })
  }
}
