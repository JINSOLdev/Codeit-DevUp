import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { In, Repository } from 'typeorm'
import { Challenge, ChallengeParticipationStatus, ChallengeStatus } from './challenge.entity'
import { ChallengeMember, MemberType } from '../challenge-member/challenge-member.entity'
import { ApplicationStatus, ChallengeApplication } from '../challenge-applications/challenge-application.entity'
import { ChallengeLiked } from '../challenge-liked/challenge-liked.entity'
import {
  ChallengeVerification,
  ChallengeVerificationStatus
} from '../challenge-verification/challenge-verification.entity'
import { PostChallengeReqDto } from './dto/req/post-challenge.req.dto'
import { ChallengeSortType, GetChallengesReqDto, UserApplicationStatusFilter } from './dto/req/get-challenges.req.dto'
import { PostChallengeCreateResponseDto } from './dto/res/post-challenge-create-res.dto'
import { GetChallengeResDto } from './dto/res/get-challenge.res.dto'
import { GetChallengesResDto } from './dto/res/get-challenges.res.dto'
import { PatchChallengeReqDto } from './dto/req/patch-challenge.req.dto'
import { PatchChallengeResDto } from './dto/res/patch-challenge.res.dto'
import { ChallengeEventPublisher } from '../event-emitter/challenge-event/challenge-event.publisher'
import { ChallengeEventType } from '../event-emitter/challenge-event/types/event.types'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'

dayjs.extend(utc)
dayjs.extend(timezone)

@Injectable()
export class ChallengeService {
  constructor(
    @InjectRepository(Challenge)
    private readonly challengeRepository: Repository<Challenge>,
    @InjectRepository(ChallengeMember)
    private readonly memberRepository: Repository<ChallengeMember>,
    @InjectRepository(ChallengeApplication)
    private readonly applicationRepository: Repository<ChallengeApplication>,
    @InjectRepository(ChallengeLiked)
    private readonly likedRepository: Repository<ChallengeLiked>,
    @InjectRepository(ChallengeVerification)
    private readonly verificationRepository: Repository<ChallengeVerification>,
    private readonly eventPublisher: ChallengeEventPublisher
  ) {}

  async create(hostId: number, data: PostChallengeReqDto): Promise<PostChallengeCreateResponseDto> {
    const {
      title,
      description,
      tags,
      startDate,
      endDate,
      recruitDeadline,
      verificationFrequency,
      verificationMethod,
      maxParticipants,
      joinType
    } = data

    const now = new Date()

    if (new Date(recruitDeadline) <= now) {
      throw new BadRequestException({
        message: '모집 마감일은 현재 시간보다 미래여야 합니다.',
        code: 'INVALID_RECRUIT_DEADLINE'
      })
    }

    if (new Date(recruitDeadline) >= new Date(startDate)) {
      throw new BadRequestException({
        message: '모집 마감일은 챌린지 시작일 이전이어야 합니다.',
        code: 'INVALID_RECRUIT_DEADLINE'
      })
    }

    if (new Date(endDate) <= new Date(startDate)) {
      throw new BadRequestException({
        message: '챌린지 종료일은 시작일 이후여야 합니다.',
        code: 'INVALID_CHALLENGE_PERIOD'
      })
    }

    if (tags.length > 3) {
      throw new BadRequestException({
        message: '태그는 최대 3개까지 입력할 수 있습니다.',
        code: 'TAG_LIMIT_EXCEEDED'
      })
    }

    const hasTooLongTag = tags.some((tag) => tag.replace(/\s/g, '').length > 6)
    if (hasTooLongTag) {
      throw new BadRequestException({
        message: '태그는 공백 제외 최대 6자까지 입력할 수 있습니다.',
        code: 'TAG_LENGTH_EXCEEDED'
      })
    }

    if (maxParticipants < 1) {
      throw new BadRequestException({
        message: '모집 정원은 1명 이상이어야 합니다.',
        code: 'INVALID_MAX_PARTICIPANTS'
      })
    }

    const challenge = new Challenge({
      hostId,
      title,
      description,
      tags,
      startDate,
      endDate,
      recruitDeadline,
      verificationFrequency,
      verificationMethod,
      maxParticipants,
      joinType,
      status: ChallengeStatus.RECRUITING,
      viewCount: 0
    })

    await this.challengeRepository.save(challenge)

    const hostMember = new ChallengeMember({
      challengeId: challenge.id,
      userId: hostId,
      memberType: MemberType.HOST
    })

    await this.memberRepository.save(hostMember)

    return {
      message: '챌린지가 생성되었습니다.',
      data: {
        id: challenge.id,
        title: challenge.title,
        description: challenge.description,
        tags: challenge.tags,
        startDate: challenge.startDate,
        endDate: challenge.endDate,
        recruitDeadline: challenge.recruitDeadline,
        verificationFrequency: challenge.verificationFrequency,
        maxParticipants: challenge.maxParticipants,
        joinType: challenge.joinType,
        status: challenge.status,
        hostId: challenge.hostId,
        createdAt: challenge.createdAt.toISOString()
      }
    }
  }

  async findAll(params: GetChallengesReqDto, userId?: number): Promise<GetChallengesResDto> {
    const page = Number(params.page ?? 1)
    const limit = Number(params.limit ?? 8)
    const skip = (page - 1) * limit
    const { status, participationType, tag, sort, isMember, isHost, applicationStatus } = params

    const query = this.challengeRepository
      .createQueryBuilder('c')
      .leftJoinAndSelect('c.host', 'u')
      .addSelect('(SELECT COUNT(*) FROM "ChallengeMember" cm WHERE cm."challengeId" = c.id)', 'participantCount')

    // Filter by calculated status based on dates and participant count
    if (status) {
      const today = dayjs().tz('Asia/Seoul').format('YYYY-MM-DD')
      switch (status) {
        case ChallengeStatus.COMPLETED:
          query.andWhere('c."endDate" < :today', { today })
          break
        case ChallengeStatus.IN_PROGRESS:
          query.andWhere('c."startDate" <= :today AND c."endDate" >= :today', { today })
          break
        case ChallengeStatus.RECRUITMENT_CLOSED:
          query.andWhere(
            '(c."recruitDeadline" <= :today OR EXISTS (SELECT 1 FROM "ChallengeMember" cm WHERE cm."challengeId" = c.id GROUP BY cm."challengeId" HAVING COUNT(*) >= c."maxParticipants")) AND c."startDate" > :today',
            { today }
          )
          break
        case ChallengeStatus.RECRUITING:
          query.andWhere(
            'c."recruitDeadline" > :today AND c."startDate" > :today AND NOT EXISTS (SELECT 1 FROM "ChallengeMember" cm WHERE cm."challengeId" = c.id GROUP BY cm."challengeId" HAVING COUNT(*) >= c."maxParticipants")',
            { today }
          )
          break
      }
    }
    if (participationType) query.andWhere('c.joinType = :participationType', { participationType })
    if (tag) query.andWhere(':tag = ANY(c.tags)', { tag })

    if (isMember && userId) {
      query.andWhere(
        `EXISTS (SELECT 1 FROM "ChallengeMember" cm WHERE cm."challengeId" = c.id AND cm."userId" = :userId AND cm."memberType" = :memberType)`,
        { userId, memberType: MemberType.MEMBER }
      )
    }
    if (isHost && userId) {
      query.andWhere(
        `EXISTS (SELECT 1 FROM "ChallengeMember" cm WHERE cm."challengeId" = c.id AND cm."userId" = :userId AND cm."memberType" = :hostType)`,
        { userId, hostType: MemberType.HOST }
      )
    }
    const applicationStatusMapByFilter: Record<UserApplicationStatusFilter, ApplicationStatus> = {
      pending: ApplicationStatus.PENDING,
      approved: ApplicationStatus.APPROVED,
      rejected: ApplicationStatus.REJECTED
    }
    const mappedApplicationStatus = applicationStatus ? applicationStatusMapByFilter[applicationStatus] : undefined

    if (mappedApplicationStatus && userId) {
      query.andWhere(
        `EXISTS (SELECT 1 FROM "ChallengeApplication" ca WHERE ca."challengeId" = c.id AND ca."userId" = :userId AND ca."status" = :applicationStatus)`,
        { userId, applicationStatus: mappedApplicationStatus }
      )
    }

    switch (sort) {
      case ChallengeSortType.popular:
        query.orderBy('c.viewCount', 'DESC')
        break
      case ChallengeSortType.deadline:
        query.orderBy('c.recruitDeadline', 'ASC')
        break
      case ChallengeSortType.oldest:
        query.orderBy('c.createdAt', 'ASC')
        break
      default:
        query.orderBy('c.createdAt', 'DESC')
    }

    const totalCount = await query.getCount()
    const { entities: challenges, raw } = await query.skip(skip).take(limit).getRawAndEntities()

    let membershipMap = new Map<number, MemberType>()
    let likedSet = new Set<number>()
    let applicationMap = new Map<
      number,
      {
        id: number
        status: ApplicationStatus
        reasonCategory: ChallengeApplication['reasonCategory'] | null
        reasonDetail: string | null
      }
    >()
    if (userId && challenges.length > 0) {
      const [memberships, likes, applications] = await Promise.all([
        this.memberRepository.find({
          where: { challengeId: In(challenges.map((c) => c.id)), userId },
          select: ['challengeId', 'memberType']
        }),
        this.likedRepository.find({
          where: { challengeId: In(challenges.map((c) => c.id)), userId },
          select: ['challengeId']
        }),
        this.applicationRepository.find({
          where: { challengeId: In(challenges.map((c) => c.id)), userId },
          select: ['id', 'challengeId', 'status', 'reasonCategory', 'reasonDetail']
        })
      ])
      membershipMap = new Map(memberships.map((m) => [m.challengeId, m.memberType]))
      likedSet = new Set(likes.map((l) => l.challengeId))
      applicationMap = new Map(
        applications.map((application) => [
          application.challengeId,
          {
            id: application.id,
            status: application.status,
            reasonCategory: application.reasonCategory ?? null,
            reasonDetail: application.reasonDetail ?? null
          }
        ])
      )
    }

    const data = challenges.map((challenge, i) => {
      const participantCount = Number(raw[i]?.participantCount ?? 0)
      const computedStatus = this.getChallengeStatus(challenge, participantCount)
      const progressRate = this.getProgressRate(challenge.startDate, challenge.endDate)
      const isJoinable = computedStatus === ChallengeStatus.RECRUITING
      const joinButtonLabel = this.getJoinButtonLabel(computedStatus)

      let myParticipationStatus = ChallengeParticipationStatus.NONE
      if (userId) {
        const membership = membershipMap.get(challenge.id)
        const application = applicationMap.get(challenge.id)
        const applicationStatus = application?.status

        if (membership) {
          myParticipationStatus = ChallengeParticipationStatus.JOINED
        } else if (applicationStatus === ApplicationStatus.PENDING) {
          myParticipationStatus = ChallengeParticipationStatus.PENDING
        } else if (applicationStatus === ApplicationStatus.REJECTED) {
          myParticipationStatus = ChallengeParticipationStatus.REJECTED
        }
      }

      return {
        id: challenge.id,
        title: challenge.title,
        host: {
          id: challenge.host?.id ?? challenge.hostId,
          nickname: challenge.host?.nickname ?? '',
          profileImageUrl: challenge.host?.profileImageUrl
        },
        status: computedStatus,
        participationType: challenge.joinType,
        tags: challenge.tags ?? [],
        verificationFrequency: challenge.verificationFrequency,
        startDate: challenge.startDate,
        endDate: challenge.endDate,
        recruitDeadline: challenge.recruitDeadline,
        participantCount,
        maxParticipants: challenge.maxParticipants,
        progressRate,
        viewCount: challenge.viewCount ?? 0,
        commentCount: 0,
        isBookmarked: false,
        isMember: userId
          ? membershipMap.get(challenge.id) === MemberType.MEMBER || membershipMap.get(challenge.id) === MemberType.HOST
          : false,
        isHost: userId ? membershipMap.get(challenge.id) === MemberType.HOST : false,
        isLiked: userId ? likedSet.has(challenge.id) : false,
        isJoinable,
        joinButtonLabel,
        myParticipationStatus,
        application: userId ? (applicationMap.get(challenge.id) ?? null) : null
      }
    })

    return {
      data,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: totalCount === 0 ? 0 : Math.ceil(totalCount / limit),
        hasNext: page * limit < totalCount
      }
    }
  }

  async findOne(challengeId: number, userId?: number): Promise<GetChallengeResDto> {
    const challenge = await this.challengeRepository.findOne({
      where: { id: challengeId },
      relations: { host: true }
    })

    if (!challenge) {
      throw new NotFoundException()
    }

    const participantCount = await this.memberRepository.count({ where: { challengeId: challenge.id } })
    const membership = userId ? await this.memberRepository.findOne({ where: { challengeId, userId } }) : null
    const application =
      userId && !membership
        ? await this.applicationRepository.findOne({ where: { challengeId, userId }, order: { createdAt: 'DESC' } })
        : null
    const liked = userId ? await this.likedRepository.findOne({ where: { challengeId, userId } }) : null

    const members = await this.memberRepository.find({
      where: { challengeId: challenge.id },
      select: ['userId']
    })

    const memberIds = members.map((m) => m.userId)
    const verifications = await this.verificationRepository.find({
      where: {
        challengeId: challenge.id,
        userId: In(memberIds),
        status: ChallengeVerificationStatus.APPROVED
      },
      select: ['userId']
    })

    const verifiedUserIds = new Set(verifications.map((v) => v.userId))
    const verifiedMemberCount = verifiedUserIds.size
    const unverifiedMemberCount = memberIds.length - verifiedMemberCount

    const status = this.getChallengeStatus(challenge, participantCount)
    const progressRate = this.getProgressRate(challenge.startDate, challenge.endDate)

    let myParticipationStatus = ChallengeParticipationStatus.NONE
    if (membership) {
      myParticipationStatus = ChallengeParticipationStatus.JOINED
    } else if (application?.status === ApplicationStatus.PENDING) {
      myParticipationStatus = ChallengeParticipationStatus.PENDING
    } else if (application?.status === ApplicationStatus.REJECTED) {
      myParticipationStatus = ChallengeParticipationStatus.REJECTED
    }

    return {
      data: {
        id: challenge.id,
        title: challenge.title,
        description: challenge.description,
        tags: challenge.tags ?? [],
        status,
        joinType: challenge.joinType,
        recruitDeadline: challenge.recruitDeadline,
        startDate: challenge.startDate,
        endDate: challenge.endDate,
        verificationFrequency: challenge.verificationFrequency,
        verificationMethod: challenge.verificationMethod,
        participantCount,
        maxParticipants: challenge.maxParticipants,
        progressRate,
        viewCount: challenge.viewCount ?? 0,
        commentCount: 0,
        isBookmarked: false,
        isHost: membership?.memberType === MemberType.HOST,
        isMember: membership?.memberType === MemberType.MEMBER || membership?.memberType === MemberType.HOST,
        isLiked: !!liked,
        myParticipationStatus,
        isJoinable: status === ChallengeStatus.RECRUITING,
        verifiedMemberCount,
        unverifiedMemberCount,
        host: {
          id: challenge.host?.id ?? challenge.hostId,
          nickname: challenge.host?.nickname ?? '',
          profileImageUrl: challenge.host?.profileImageUrl
        },
        createdAt: challenge.createdAt.toISOString(),
        updatedAt: challenge.updatedAt.toISOString()
      }
    }
  }

  async update(challengeId: number, userId: number, data: PatchChallengeReqDto): Promise<PatchChallengeResDto> {
    const challenge = await this.challengeRepository.findOne({
      where: { id: challengeId }
    })

    if (!challenge) {
      throw new NotFoundException({
        message: '챌린지를 찾을 수 없습니다.',
        code: 'CHALLENGE_NOT_FOUND'
      })
    }

    if (challenge.hostId !== userId) {
      throw new ForbiddenException({
        message: '챌린지를 수정할 권한이 없습니다.',
        code: 'FORBIDDEN'
      })
    }

    console.log('❣️PATCH BODY:', data)

    const updateData: Partial<Challenge> = {}

    if (data.title !== undefined) updateData.title = data.title
    if (data.description !== undefined) updateData.description = data.description
    if (data.tags !== undefined) updateData.tags = data.tags
    if (data.startDate !== undefined) updateData.startDate = data.startDate
    if (data.endDate !== undefined) updateData.endDate = data.endDate
    if (data.recruitDeadline !== undefined) updateData.recruitDeadline = data.recruitDeadline
    if (data.verificationFrequency !== undefined) {
      updateData.verificationFrequency = data.verificationFrequency
    }
    if (data.verificationMethod !== undefined) {
      updateData.verificationMethod = data.verificationMethod
    }
    if (data.maxParticipants !== undefined) {
      updateData.maxParticipants = data.maxParticipants
    }
    if (data.joinType !== undefined) {
      updateData.joinType = data.joinType
    }
    if (data.status !== undefined) {
      updateData.status = data.status
    }

    if (Object.keys(updateData).length === 0) {
      throw new BadRequestException({
        message: '수정할 항목이 없습니다.',
        code: 'EMPTY_UPDATE_DATA'
      })
    }

    const nextStartDate = updateData.startDate ?? challenge.startDate
    const nextEndDate = updateData.endDate ?? challenge.endDate
    const nextRecruitDeadline = updateData.recruitDeadline ?? challenge.recruitDeadline
    const nextStatus = updateData.status ?? challenge.status
    const today = dayjs().tz('Asia/Seoul').format('YYYY-MM-DD')

    if (new Date(nextRecruitDeadline) >= new Date(nextStartDate)) {
      throw new BadRequestException({
        message: '모집 마감일은 챌린지 시작일 이전이어야 합니다.',
        code: 'INVALID_RECRUIT_DEADLINE'
      })
    }

    if (new Date(nextEndDate) <= new Date(nextStartDate)) {
      throw new BadRequestException({
        message: '챌린지 종료일은 시작일 이후여야 합니다.',
        code: 'INVALID_CHALLENGE_PERIOD'
      })
    }

    if (nextStatus === ChallengeStatus.RECRUITING && nextRecruitDeadline <= today) {
      throw new BadRequestException({
        message: '모집 중 상태에서는 모집 마감일이 오늘 이후여야 합니다.',
        code: 'INVALID_STATUS_DATE'
      })
    }
    if (nextStatus === ChallengeStatus.IN_PROGRESS && (nextStartDate > today || nextEndDate < today)) {
      throw new BadRequestException({
        message: '진행 중 상태에서는 시작일이 오늘 이전이고 종료일이 오늘 이후여야 합니다.',
        code: 'INVALID_STATUS_DATE'
      })
    }
    if (nextStatus === ChallengeStatus.COMPLETED && nextEndDate > today) {
      throw new BadRequestException({
        message: '완료 상태에서는 종료일이 오늘 이전이어야 합니다.',
        code: 'INVALID_STATUS_DATE'
      })
    }

    if (updateData.tags) {
      if (updateData.tags.length > 3) {
        throw new BadRequestException({
          message: '태그는 최대 3개까지 입력할 수 있습니다.',
          code: 'TAG_LIMIT_EXCEEDED'
        })
      }

      const hasTooLongTag = updateData.tags.some((tag) => tag.replace(/\s/g, '').length > 6)
      if (hasTooLongTag) {
        throw new BadRequestException({
          message: '태그는 공백 제외 최대 6자까지 입력할 수 있습니다.',
          code: 'TAG_LENGTH_EXCEEDED'
        })
      }
    }

    if (updateData.maxParticipants !== undefined) {
      const currentParticipantCount = await this.memberRepository.count({
        where: { challengeId }
      })
      if (updateData.maxParticipants < currentParticipantCount) {
        throw new BadRequestException({
          message: `현재 참여자 수 (${currentParticipantCount}명)보다 적은 정원으로 변경할 수 없습니다.`,
          code: 'MAX_PARTICIPANTS_BELOW_CURRENT'
        })
      }
    }

    await this.challengeRepository.update({ id: challengeId }, updateData)

    const updatedChallenge = await this.challengeRepository.findOne({
      where: { id: challengeId }
    })

    if (!updatedChallenge) {
      throw new NotFoundException({
        message: '수정된 챌린지를 찾을 수 없습니다.',
        code: 'CHALLENGE_NOT_FOUND'
      })
    }

    return {
      message: '챌린지가 수정되었습니다.',
      data: {
        id: updatedChallenge.id,
        title: updatedChallenge.title,
        description: updatedChallenge.description,
        tags: updatedChallenge.tags,
        startDate: updatedChallenge.startDate,
        endDate: updatedChallenge.endDate,
        recruitDeadline: updatedChallenge.recruitDeadline,
        verificationFrequency: updatedChallenge.verificationFrequency,
        verificationMethod: updatedChallenge.verificationMethod,
        maxParticipants: updatedChallenge.maxParticipants,
        joinType: updatedChallenge.joinType,
        status: updatedChallenge.status,
        hostId: updatedChallenge.hostId,
        createdAt: updatedChallenge.createdAt.toISOString(),
        updatedAt: updatedChallenge.updatedAt.toISOString()
      }
    }
  }

  async delete(challengeId: number, userId: number): Promise<{ message: string }> {
    const challenge = await this.challengeRepository.findOne({
      where: { id: challengeId }
    })

    if (!challenge) {
      throw new NotFoundException({
        message: '챌린지를 찾을 수 없습니다.',
        code: 'CHALLENGE_NOT_FOUND'
      })
    }

    if (challenge.hostId !== userId) {
      throw new ForbiddenException({
        message: '챌린지를 삭제할 권한이 없습니다.',
        code: 'FORBIDDEN'
      })
    }

    const recipientIds = await this.getChallengeCancelRecipients(challenge.id)
    this.eventPublisher.publish({
      type: ChallengeEventType.MEETING_CANCELED,
      metadata: {
        challengeId: challenge.id,
        challengeTitle: challenge.title,
        recipientIds
      }
    })
    await this.challengeRepository.softDelete({ id: challengeId })

    return {
      message: '챌린지가 삭제되었습니다.'
    }
  }

  async incrementViewCount(challengeId: number): Promise<void> {
    await this.challengeRepository.increment({ id: challengeId }, 'viewCount', 1)
  }

  async updateExpiredChallengeStatuses(): Promise<number> {
    const today = dayjs().tz('Asia/Seoul').format('YYYY-MM-DD')

    const becomingInProgress = await this.challengeRepository.find({
      where: [{ status: ChallengeStatus.RECRUITING }, { status: ChallengeStatus.RECRUITMENT_CLOSED }],
      select: ['id', 'title', 'startDate', 'endDate']
    })
    const inProgressTargets = becomingInProgress.filter(
      (challenge) => challenge.startDate <= today && challenge.endDate >= today
    )
    const inProgressTargetIds = inProgressTargets.map((challenge) => challenge.id)

    const [completedResult, inProgressResult, recruitmentClosedResult] = await Promise.all([
      this.challengeRepository
        .createQueryBuilder()
        .update(Challenge)
        .set({ status: ChallengeStatus.COMPLETED })
        .where('status != :status', { status: ChallengeStatus.COMPLETED })
        .andWhere('"endDate" < :today', { today })
        .execute(),
      this.challengeRepository
        .createQueryBuilder()
        .update(Challenge)
        .set({ status: ChallengeStatus.IN_PROGRESS })
        .where('id IN (:...ids)', { ids: inProgressTargetIds.length ? inProgressTargetIds : [0] })
        .execute(),
      this.challengeRepository
        .createQueryBuilder()
        .update(Challenge)
        .set({ status: ChallengeStatus.RECRUITMENT_CLOSED })
        .where('status = :status', { status: ChallengeStatus.RECRUITING })
        .andWhere('"recruitDeadline" <= :today', { today })
        .andWhere('"startDate" > :today', { today })
        .execute()
    ])

    if ((inProgressResult.affected ?? 0) > 0 && inProgressTargets.length > 0) {
      const members = await this.memberRepository.find({
        where: { challengeId: In(inProgressTargetIds) },
        select: ['challengeId', 'userId']
      })
      const recipientsByChallengeId = members.reduce((acc, member) => {
        const existing = acc.get(member.challengeId) ?? new Set<number>()
        existing.add(member.userId)
        acc.set(member.challengeId, existing)
        return acc
      }, new Map<number, Set<number>>())

      for (const challenge of inProgressTargets) {
        this.eventPublisher.publish({
          type: ChallengeEventType.MEETING_CONFIRMED,
          metadata: {
            challengeId: challenge.id,
            challengeTitle: challenge.title,
            recipientIds: Array.from(recipientsByChallengeId.get(challenge.id) ?? [])
          }
        })
      }
    }

    return (completedResult.affected ?? 0) + (inProgressResult.affected ?? 0) + (recruitmentClosedResult.affected ?? 0)
  }

  private getDateOnly(date: string | Date): Date {
    const value = new Date(date)
    return new Date(value.getFullYear(), value.getMonth(), value.getDate())
  }

  private getProgressRate(startDate: string | Date, endDate: string | Date): number {
    const today = this.getDateOnly(new Date())
    const start = this.getDateOnly(startDate)
    const end = this.getDateOnly(endDate)

    if (today < start) {
      return 0
    }

    if (today > end) {
      return 100
    }

    const totalDays = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1)
    const elapsedDays = Math.max(0, Math.ceil((today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1)

    return Math.min(100, Math.max(0, Math.floor((elapsedDays / totalDays) * 100)))
  }

  private getChallengeStatus(challenge: Challenge, participantCount: number): ChallengeStatus {
    const today = this.getDateOnly(new Date())
    const recruitDeadline = this.getDateOnly(challenge.recruitDeadline)
    const startDate = this.getDateOnly(challenge.startDate)
    const endDate = this.getDateOnly(challenge.endDate)

    if (today > endDate) {
      return ChallengeStatus.COMPLETED
    }

    if (today >= startDate) {
      return ChallengeStatus.IN_PROGRESS
    }

    if (today >= recruitDeadline || participantCount >= challenge.maxParticipants) {
      return ChallengeStatus.RECRUITMENT_CLOSED
    }

    return ChallengeStatus.RECRUITING
  }

  private getJoinButtonLabel(status: ChallengeStatus): string {
    switch (status) {
      case ChallengeStatus.RECRUITING:
        return '참여하기'
      case ChallengeStatus.RECRUITMENT_CLOSED:
        return '모집마감'
      case ChallengeStatus.IN_PROGRESS:
        return '진행중'
      case ChallengeStatus.COMPLETED:
        return '완료'
      default:
        return '참여하기'
    }
  }

  private async getChallengeCancelRecipients(challengeId: number): Promise<number[]> {
    const [members, applications] = await Promise.all([
      this.memberRepository.find({ where: { challengeId }, select: ['userId'] }),
      this.applicationRepository.find({ where: { challengeId }, select: ['userId'] })
    ])
    return Array.from(
      new Set([...members.map((member) => member.userId), ...applications.map((application) => application.userId)])
    )
  }
}
