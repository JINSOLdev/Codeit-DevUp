import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { DataSource, Repository } from 'typeorm'
import { User } from '../user/entities/user.entity'
import { Project } from '../project/project.entity'
import { ProjectStatus } from '../project/project.types'
import { ProjectMember, MemberType as ProjectMemberType } from '../project-member/project-member.entity'
import { Challenge } from '../challenge/challenge.entity'
import { ChallengeStatus } from '../challenge/challenge.types'
import { ChallengeMember, MemberType as ChallengeMemberType } from '../challenge-member/challenge-member.entity'
import { GetMyPageResDto } from './dto/get-mypage.res.dto'
import { GetMyCommentsReqDto, CommentTargetType } from './dto/get-my-comments.req.dto'
import { GetMyCommentsResDto } from './dto/get-my-comments.res.dto'
import { JobLabel, Skill } from '../user/user.type'

@Injectable()
export class MyPageService {
  constructor(
    private readonly dataSource: DataSource,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,

    @InjectRepository(ProjectMember)
    private readonly projectMemberRepository: Repository<ProjectMember>,

    @InjectRepository(Challenge)
    private readonly challengeRepository: Repository<Challenge>,

    @InjectRepository(ChallengeMember)
    private readonly challengeMemberRepository: Repository<ChallengeMember>
  ) {}

  async getMyPage(userId: number): Promise<GetMyPageResDto> {
    const user = await this.userRepository.findOne({
      where: { id: userId }
    })

    if (!user) {
      throw new NotFoundException('유저를 찾을 수 없습니다.')
    }

    const [challengeCount, projectCount, ongoingChallenges, ongoingProjects] = await Promise.all([
      this.challengeMemberRepository.count({
        where: { userId }
      }),
      this.projectMemberRepository.count({
        where: { userId }
      }),
      this.getOngoingChallenges(userId),
      this.getOngoingProjects(userId)
    ])

    return {
      data: {
        profile: {
          id: user.id,
          email: user.email,
          nickname: user.nickname,
          jobLabel: user.jobLabel ?? null,
          bio: user.bio ?? null,
          profileImageUrl: user.profileImageUrl ?? null,
          skills: user.skills ?? []
        },
        stats: {
          challengeCount,
          projectCount,
          demoDayCount: 0,
          totalVerificationCount: 0
        },
        overview: {
          ongoingChallenges,
          ongoingProjects
        }
      }
    }
  }

  async getMyComments(userId: number, options: GetMyCommentsReqDto): Promise<GetMyCommentsResDto> {
    const { start, perPage, type } = options

    const projectSelect = `
      SELECT
        'project' AS type,
        pc.id,
        pc."userId",
        pc.content,
        pc."createdAt",
        p.id AS "targetId",
        p.title,
        u.id AS "commentUserId",
        u.nickname AS "commentUserNickname",
        u."jobLabel" AS "commentUserJobLabel",
        u."profileImageUrl" AS "commentUserProfileImageUrl",
        u.skills AS "commentUserSkills"
      FROM "ProjectComment" pc
      INNER JOIN "Project" p ON p.id = pc."projectId"
      INNER JOIN "User" u ON u.id = pc."userId"
      WHERE pc."userId" = $1 AND pc."deletedAt" IS NULL
    `
    const challengeSelect = `
      SELECT
        'challenge' AS type,
        cc.id,
        cc."userId",
        cc.content,
        cc."createdAt",
        c.id AS "targetId",
        c.title,
        u.id AS "commentUserId",
        u.nickname AS "commentUserNickname",
        u."jobLabel" AS "commentUserJobLabel",
        u."profileImageUrl" AS "commentUserProfileImageUrl",
        u.skills AS "commentUserSkills"
      FROM "ChallengeComment" cc
      INNER JOIN "Challenge" c ON c.id = cc."challengeId"
      INNER JOIN "User" u ON u.id = cc."userId"
      WHERE cc."userId" = $1 AND cc."deletedAt" IS NULL AND c."deletedAt" IS NULL
    `

    const unionSql =
      type === CommentTargetType.project
        ? projectSelect
        : type === CommentTargetType.challenge
          ? challengeSelect
          : `${projectSelect} UNION ALL ${challengeSelect}`

    const [{ count }] = await this.dataSource.query<[{ count: string }]>(
      `SELECT COUNT(*) AS count FROM (${unionSql}) t`,
      [userId]
    )

    const rows = await this.dataSource.query<
      Array<{
        type: string
        id: number
        userId: number
        content: string
        createdAt: Date
        targetId: number
        title: string
        commentUserId: number
        commentUserNickname: string
        commentUserJobLabel: JobLabel | null
        commentUserProfileImageUrl: string | null
        commentUserSkills: Skill[] | null
      }>
    >(`SELECT * FROM (${unionSql}) t ORDER BY "createdAt" DESC LIMIT $2 OFFSET $3`, [userId, perPage, start])

    return {
      data: rows.map((row) => ({
        id: Number(row.id),
        userId: Number(row.userId),
        type: row.type as CommentTargetType,
        targetId: Number(row.targetId),
        title: row.title,
        content: row.content,
        createdAt: new Date(row.createdAt),
        user: {
          id: Number(row.commentUserId),
          nickname: row.commentUserNickname,
          jobLabel: row.commentUserJobLabel,
          profileImageUrl: row.commentUserProfileImageUrl,
          skills: row.commentUserSkills ?? []
        }
      })),
      total: Number(count)
    }
  }
  //
  private async getOngoingProjects(userId: number) {
    const memberships = await this.projectMemberRepository.find({
      where: { userId },
      relations: { project: true },
      order: { joinedAt: 'DESC' }
    })

    const filteredMemberships = memberships.filter((membership) => {
      if (!membership.project) return false

      return (
        membership.project.status === ProjectStatus.recruiting ||
        membership.project.status === ProjectStatus.recruitment_closed
      )
    })

    const projectIds = filteredMemberships.map((membership) => membership.projectId)

    const memberCounts =
      projectIds.length > 0
        ? await this.projectMemberRepository
            .createQueryBuilder('pm')
            .select('pm.projectId', 'projectId')
            .addSelect('COUNT(pm.id)', 'memberCount')
            .where('pm.projectId IN (:...projectIds)', { projectIds })
            .groupBy('pm.projectId')
            .getRawMany<{ projectId: string; memberCount: string }>()
        : []

    const memberCountMap = new Map<number, number>(
      memberCounts.map((item) => [Number(item.projectId), Number(item.memberCount)])
    )

    return filteredMemberships.map((membership) => ({
      projectId: membership.project.id,
      title: membership.project.title,
      roleLabel: membership.position ?? (membership.memberType === ProjectMemberType.HOST ? '호스트' : '멤버'),
      status: membership.project.status,
      memberCount: memberCountMap.get(membership.project.id) ?? 1,
      maxMembers: membership.project.maxMembers
    }))
  }

  private async getOngoingChallenges(userId: number) {
    const memberships = await this.challengeMemberRepository.find({
      where: { userId },
      relations: { challenge: true },
      order: { joinedAt: 'DESC' }
    })

    const filteredMemberships = memberships.filter((membership) => {
      if (!membership.challenge) return false
      return this.isOngoingChallenge(membership.challenge)
    })

    return filteredMemberships.map((membership) => ({
      challengeId: membership.challenge.id,
      title: membership.challenge.title,
      endDate: membership.challenge.endDate,
      progressRate: this.calculateProgressRate(membership.challenge.startDate, membership.challenge.endDate)
    }))
  }

  private isOngoingChallenge(challenge: Challenge): boolean {
    const today = new Date()
    const endDate = new Date(challenge.endDate)

    const isDateOngoing = endDate >= today
    const isStatusOngoing =
      challenge.status === ChallengeStatus.RECRUITING || challenge.status === ChallengeStatus.IN_PROGRESS

    return isDateOngoing && isStatusOngoing
  }

  private calculateProgressRate(startDate: string, endDate: string): number {
    const today = new Date()
    const start = new Date(startDate)
    const end = new Date(endDate)

    if (today <= start) return 0
    if (today >= end) return 100

    const total = end.getTime() - start.getTime()
    const current = today.getTime() - start.getTime()

    if (total <= 0) return 0

    return Math.floor((current / total) * 100)
  }
}
