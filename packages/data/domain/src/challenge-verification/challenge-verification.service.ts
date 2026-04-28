import { ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Challenge } from '../challenge/challenge.entity'
import { ChallengeService } from '../challenge/challenge.service'
import { ChallengeMember } from '../challenge-member/challenge-member.entity'
import { UserService } from '../user/user.service'
import { ChallengeVerification, ChallengeVerificationStatus } from './challenge-verification.entity'
import { ChallengeVerificationFrequency } from '../challenge/challenge.types'
import { PostChallengeVerificationReqDto } from './dto/req/post-challenge-verification.req.dto'

export interface CreateChallengeVerificationResDto {
  verificationId: number
  challengeId: number
  user: {
    id: number
    nickname: string
    profileImageUrl: string | null
  }
  title: string
  content: string
  imageUrls: string[]
  status: ChallengeVerificationStatus
  createdAt: string
}

export interface UpdateChallengeVerificationReqDto {
  title?: string
  content?: string
  imageUrls?: string[]
}

export interface UpdateChallengeVerificationResDto {
  verificationId: number
  challengeId: number
  title: string
  content: string
  imageUrls: string[]
  status: ChallengeVerificationStatus
  updatedAt: string
}

export interface GetMyVerificationStatusResDto {
  challengeId: number
  userId: number
  verificationFrequency: ChallengeVerificationFrequency
  myVerificationStatus: 'BEFORE' | 'PENDING' | 'APPROVED' | 'REJECTED'
  verifiedInCurrentCycle: boolean
  canCreate: boolean
  canEdit: boolean
  canDelete: boolean
  message: string
}

export interface GetChallengeVerificationsResDto {
  verifications: {
    verificationId: number
    challengeId: number
    user: {
      id: number
      nickname: string
      profileImageUrl: string | null
    }
    createdAt: string
    updatedAt: string
    status: ChallengeVerificationStatus
    reviewedAt?: string
    rejectionReason?: string
  }[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

export interface GetChallengeVerificationResDto {
  verificationId: number
  challengeId: number
  user: {
    id: number
    nickname: string
    profileImageUrl: string | null
  }
  createdAt: string
  updatedAt: string
  status: ChallengeVerificationStatus
  title: string
  content: string
  imageUrls: string[]
  reviewer?: {
    id: number
    nickname: string
    reviewedAt: string
  }
  rejectionReason?: string
}

export interface GetMemberProgressResDto {
  message: string
  data: {
    userId: number
    nickname: string
    profileImageUrl?: string
    progressPercentage: number
    totalRequiredDays: number
    completedDays: number
    remainingDays: number
    status: 'ON_TRACK' | 'BEHIND' | 'AHEAD' | 'COMPLETED'
    todayVerificationStatus?: ChallengeVerificationStatus
  }
}

export interface GetChallengeMembersProgressResDto {
  message: string
  members: {
    userId: number
    nickname: string
    profileImageUrl?: string
    progressPercentage: number
    totalRequiredDays: number
    completedDays: number
    remainingDays: number
    status: 'ON_TRACK' | 'BEHIND' | 'AHEAD' | 'COMPLETED'
    todayVerificationStatus?: ChallengeVerificationStatus
  }[]
  summary: {
    averageProgress: number
    totalMembers: number
    activeMembers: number
    completedMembers: number
    verifiedTodayCount?: number
    pendingVerificationCount?: number
  }
}

@Injectable()
export class ChallengeVerificationService {
  constructor(
    @InjectRepository(ChallengeVerification)
    private challengeVerificationRepository: Repository<ChallengeVerification>,
    @InjectRepository(ChallengeMember)
    private challengeMemberRepository: Repository<ChallengeMember>,
    @InjectRepository(Challenge)
    private challengeRepository: Repository<Challenge>,
    private challengeService: ChallengeService,
    private userService: UserService
  ) {}

  async create(
    userId: number,
    challengeId: number,
    data: PostChallengeVerificationReqDto
  ): Promise<CreateChallengeVerificationResDto> {
    const challenge = await this.challengeService.findOne(challengeId)
    if (!challenge) throw new NotFoundException('챌린지가 존재하지 않습니다.')

    const challengeEntity = await this.challengeRepository.findOne({ where: { id: challengeId } })
    if (!challengeEntity) throw new NotFoundException('챌린지가 존재하지 않습니다.')

    const member = await this.challengeMemberRepository.findOne({ where: { challengeId, userId } })
    if (!member) throw new ForbiddenException('챌린지에 참여하지 않은 사용자입니다.')

    const now = new Date()
    if (new Date(challengeEntity.startDate) > now) throw new ForbiddenException('챌린지가 시작되지 않았습니다.')

    await this.checkVerificationFrequency(challengeId, userId, challengeEntity.verificationFrequency)

    // Check if the user is the challenge host - if so, auto-approve
    const isHost = challengeEntity.hostId === userId
    const verificationStatus = isHost ? ChallengeVerificationStatus.APPROVED : ChallengeVerificationStatus.PENDING

    const verification = new ChallengeVerification({
      challengeId,
      userId,
      title: data.title,
      content: data.content,
      imageUrls: data.imageUrls || [],
      status: verificationStatus
    })

    if (isHost) {
      const reviewData = {
        reviewedAt: new Date().toISOString(),
        reviewedById: userId,
        message: 'Host auto-approved verification'
      }
      verification.rejectionReason = JSON.stringify(reviewData)
    }

    const savedVerification = await this.challengeVerificationRepository.save(verification)

    const user = await this.userService.findOne(userId)

    return {
      verificationId: savedVerification.id,
      challengeId: savedVerification.challengeId,
      user: {
        id: user.id,
        nickname: user.nickname,
        profileImageUrl: user.profileImageUrl
      },
      title: savedVerification.title,
      content: savedVerification.content,
      imageUrls: savedVerification.imageUrls,
      status: savedVerification.status,
      createdAt: savedVerification.createdAt.toISOString()
    }
  }

  private async checkVerificationFrequency(
    challengeId: number,
    userId: number,
    frequency: ChallengeVerificationFrequency
  ): Promise<void> {
    const now = new Date()
    let startDate: Date

    switch (frequency) {
      case ChallengeVerificationFrequency.ONCE_A_DAY:
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        break
      case ChallengeVerificationFrequency.EVERY_WEEKDAY:
        if (now.getDay() === 0 || now.getDay() === 6) {
          return
        }
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        break
      case ChallengeVerificationFrequency.ONCE_A_WEEK:
        const dayOfWeek = now.getDay()
        const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1)
        startDate = new Date(now.getFullYear(), now.getMonth(), diff)
        break
      case ChallengeVerificationFrequency.THREE_TIMES_A_WEEK:
        const dayOfWeekForThree = now.getDay()
        const diffForThree = now.getDate() - dayOfWeekForThree + (dayOfWeekForThree === 0 ? -6 : 1)
        startDate = new Date(now.getFullYear(), now.getMonth(), diffForThree)
        break
      default:
        return
    }

    const existingVerification = await this.challengeVerificationRepository.findOne({
      where: {
        challengeId,
        userId,
        createdAt: startDate as any
      }
    })

    if (existingVerification) {
      throw new ConflictException('이미 인증되었습니다.')
    }
  }

  async update(
    userId: number,
    challengeId: number,
    verificationId: number,
    data: UpdateChallengeVerificationReqDto
  ): Promise<UpdateChallengeVerificationResDto> {
    const verification = await this.challengeVerificationRepository.findOne({
      where: { id: verificationId, challengeId }
    })

    if (!verification) throw new NotFoundException('인증이 존재하지 않습니다.')

    if (verification.userId !== userId) throw new ForbiddenException('자신이 작성한 인증만 수정할 수 있습니다.')

    if (verification.status === ChallengeVerificationStatus.APPROVED)
      throw new ForbiddenException('승인된 인증은 수정할 수 없습니다.')

    if (data.title !== undefined) {
      verification.title = data.title
    }
    if (data.content !== undefined) {
      verification.content = data.content
    }
    if (data.imageUrls !== undefined) {
      verification.imageUrls = data.imageUrls
    }

    verification.status = ChallengeVerificationStatus.PENDING

    const updatedVerification = await this.challengeVerificationRepository.save(verification)

    return {
      verificationId: updatedVerification.id,
      challengeId: updatedVerification.challengeId,
      title: updatedVerification.title,
      content: updatedVerification.content,
      imageUrls: updatedVerification.imageUrls,
      status: updatedVerification.status,
      updatedAt: updatedVerification.updatedAt.toISOString()
    }
  }

  async delete(userId: number, challengeId: number, verificationId: number): Promise<void> {
    const verification = await this.challengeVerificationRepository.findOne({
      where: { id: verificationId, challengeId }
    })

    if (!verification) throw new NotFoundException('인증이 존재하지 않습니다.')

    if (verification.userId !== userId) throw new ForbiddenException('자신이 작성한 인증만 삭제할 수 있습니다.')

    await this.challengeVerificationRepository.remove(verification)
  }

  async updateStatus(
    reviewerId: number,
    challengeId: number,
    verificationId: number,
    status: ChallengeVerificationStatus,
    rejectionReason?: string
  ): Promise<{
    verificationId: number
    status: ChallengeVerificationStatus
    reviewedAt: string
    reviewedBy: {
      id: number
      nickname: string
    }
  }> {

    const verification = await this.challengeVerificationRepository.findOne({
      where: { id: verificationId, challengeId },
      relations: ['challenge']
    })


    if (!verification) throw new NotFoundException('인증 내역을 찾을 수 없습니다.')

    if (!verification.challenge) {
      const challenge = await this.challengeRepository.findOne({ where: { id: challengeId } })
      if (!challenge) throw new NotFoundException('챌린지를 찾을 수 없습니다.')
      verification.challenge = challenge
    }

    const reviewerIdNum = Number(reviewerId)

    

    if (verification.challenge.hostId !== reviewerIdNum) {
      throw new ForbiddenException('호스트만 인증 상태를 변경할 수 있습니다.')
    }

    if (verification.status !== ChallengeVerificationStatus.PENDING)
      throw new ForbiddenException('인증 상태가 대기 중이 아닙니다.')

    if (status !== ChallengeVerificationStatus.APPROVED && status !== ChallengeVerificationStatus.REJECTED)
      throw new ForbiddenException('유효하지 않은 인증 상태입니다.')

    if (status === ChallengeVerificationStatus.REJECTED && !rejectionReason)
      throw new ForbiddenException('거절 사유를 입력해주세요.')

    verification.status = status

    const reviewData = {
      reviewedAt: new Date().toISOString(),
      reviewedById: reviewerIdNum,
      ...(status === ChallengeVerificationStatus.REJECTED && { message: rejectionReason })
    }

    verification.rejectionReason = JSON.stringify(reviewData)

    const updatedVerification = await this.challengeVerificationRepository.save(verification)

    let reviewer
    try {
      reviewer = await this.userService.findOne(reviewerIdNum)
    } catch (error) {
      reviewer = { id: reviewerIdNum, nickname: 'Host' }
    }

    const reviewerNickname = reviewer?.nickname || 'Host'

    return {
      verificationId: updatedVerification.id,
      status: updatedVerification.status,
      reviewedAt: reviewData.reviewedAt,
      reviewedBy: {
        id: reviewerIdNum,
        nickname: reviewerNickname
      }
    }
  }

  async getMyVerificationStatus(userId: number, challengeId: number): Promise<GetMyVerificationStatusResDto> {
    const challenge = await this.challengeService.findOne(challengeId)
    if (!challenge) throw new NotFoundException('챌린지가 존재하지 않습니다.')

    const challengeEntity = await this.challengeRepository.findOne({ where: { id: challengeId } })
    if (!challengeEntity) throw new NotFoundException('챌린지가 존재하지 않습니다.')

    const member = await this.challengeMemberRepository.findOne({ where: { challengeId, userId } })
    if (!member) throw new ForbiddenException('챌린지 참여자만 인증 가능 여부를 확인할 수 있습니다.')

    const now = new Date()
    const isChallengeStarted = new Date(challengeEntity.startDate) <= now
    const isChallengeEnded = challengeEntity.endDate ? new Date(challengeEntity.endDate) < now : false

    const latestVerification = await this.challengeVerificationRepository.findOne({
      where: { challengeId, userId },
      order: { createdAt: 'DESC' }
    })

    let myVerificationStatus: 'BEFORE' | 'PENDING' | 'APPROVED' | 'REJECTED' = 'BEFORE'
    let verifiedInCurrentCycle = false
    let canCreate = false
    let canEdit = false
    let canDelete = false
    let message = ''

    if (latestVerification) {
      myVerificationStatus = latestVerification.status as any
      canEdit = latestVerification.status === ChallengeVerificationStatus.PENDING
      canDelete = latestVerification.status === ChallengeVerificationStatus.PENDING
    }

    if (latestVerification) {
      verifiedInCurrentCycle = await this.isVerifiedInCurrentCycle(
        challengeId,
        userId,
        challengeEntity.verificationFrequency,
        latestVerification.createdAt
      )
    }

    if (!isChallengeStarted) {
      canCreate = false
      message = '챌린지가 아직 시작되지 않았습니다.'
    } else if (isChallengeEnded) {
      canCreate = false
      message = '챌린지가 종료되었습니다.'
    } else if (verifiedInCurrentCycle) {
      canCreate = false
      message = '이미 오늘 인증을 완료하셨습니다.'
    } else if (myVerificationStatus === 'PENDING') {
      canCreate = false
      message = '대기 중인 인증이 있습니다.'
    } else {
      canCreate = true
      message = '오늘 인증을 작성할 수 있습니다.'
    }

    return {
      challengeId,
      userId,
      verificationFrequency: challengeEntity.verificationFrequency,
      myVerificationStatus,
      verifiedInCurrentCycle,
      canCreate,
      canEdit,
      canDelete,
      message
    }
  }

  private async isVerifiedInCurrentCycle(
    challengeId: number,
    userId: number,
    frequency: ChallengeVerificationFrequency,
    verificationDate: Date
  ): Promise<boolean> {
    const now = new Date()
    let cycleStartDate: Date

    switch (frequency) {
      case ChallengeVerificationFrequency.ONCE_A_DAY:
        cycleStartDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        break
      case ChallengeVerificationFrequency.EVERY_WEEKDAY:
        if (now.getDay() === 0 || now.getDay() === 6) {
          return false
        }
        cycleStartDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        break
      case ChallengeVerificationFrequency.ONCE_A_WEEK:
        const dayOfWeek = now.getDay()
        const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1)
        cycleStartDate = new Date(now.getFullYear(), now.getMonth(), diff)
        break
      case ChallengeVerificationFrequency.THREE_TIMES_A_WEEK:
        const dayOfWeekForThree = now.getDay()
        const diffForThree = now.getDate() - dayOfWeekForThree + (dayOfWeekForThree === 0 ? -6 : 1)
        cycleStartDate = new Date(now.getFullYear(), now.getMonth(), diffForThree)
        break
      default:
        return false
    }

    return verificationDate >= cycleStartDate
  }

  private async getTodayVerification(
    challengeId: number,
    userId: number,
    frequency: ChallengeVerificationFrequency
  ): Promise<ChallengeVerification | null> {
    // Get current time in KST (UTC+9)
    const now = new Date()
    const kstNow = new Date(now.getTime() + 9 * 60 * 60 * 1000)

    let startDate: Date
    let endDate: Date

    switch (frequency) {
      case ChallengeVerificationFrequency.ONCE_A_DAY:
        // KST 기준 오늘 00:00:00부터 23:59:59까지
        startDate = new Date(kstNow.getFullYear(), kstNow.getMonth(), kstNow.getDate())
        startDate.setHours(0, 0, 0, 0)
        endDate = new Date(kstNow.getFullYear(), kstNow.getMonth(), kstNow.getDate())
        endDate.setHours(23, 59, 59, 999)
        break
      case ChallengeVerificationFrequency.EVERY_WEEKDAY:
        if (kstNow.getDay() === 0 || kstNow.getDay() === 6) {
          return null
        }
        startDate = new Date(kstNow.getFullYear(), kstNow.getMonth(), kstNow.getDate())
        startDate.setHours(0, 0, 0, 0)
        endDate = new Date(kstNow.getFullYear(), kstNow.getMonth(), kstNow.getDate())
        endDate.setHours(23, 59, 59, 999)
        break
      case ChallengeVerificationFrequency.ONCE_A_WEEK:
        const dayOfWeek = kstNow.getDay()
        const diff = kstNow.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1)
        startDate = new Date(kstNow.getFullYear(), kstNow.getMonth(), diff)
        startDate.setHours(0, 0, 0, 0)
        endDate = new Date(kstNow.getFullYear(), kstNow.getMonth(), diff + 6)
        endDate.setHours(23, 59, 59, 999)
        break
      case ChallengeVerificationFrequency.THREE_TIMES_A_WEEK:
        const dayOfWeekForThree = kstNow.getDay()
        const diffForThree = kstNow.getDate() - dayOfWeekForThree + (dayOfWeekForThree === 0 ? -6 : 1)
        startDate = new Date(kstNow.getFullYear(), kstNow.getMonth(), diffForThree)
        startDate.setHours(0, 0, 0, 0)
        endDate = new Date(kstNow.getFullYear(), kstNow.getMonth(), diffForThree + 6)
        endDate.setHours(23, 59, 59, 999)
        break
      default:
        return null
    }

    const utcStartDate = new Date(startDate.getTime() - 9 * 60 * 60 * 1000)
    const utcEndDate = new Date(endDate.getTime() - 9 * 60 * 60 * 1000)

    return await this.challengeVerificationRepository
      .createQueryBuilder('verification')
      .where('verification.challengeId = :challengeId', { challengeId })
      .andWhere('verification.userId = :userId', { userId })
      .andWhere('verification.createdAt BETWEEN :startDate AND :endDate', {
        startDate: utcStartDate,
        endDate: utcEndDate
      })
      .orderBy('verification.createdAt', 'DESC')
      .getOne()
  }

  async getChallengeVerifications(
    challengeId: number,
    page: number = 1,
    limit: number = 20,
    status?: ChallengeVerificationStatus
  ): Promise<GetChallengeVerificationsResDto> {
    const challenge = await this.challengeService.findOne(challengeId)
    if (!challenge) throw new NotFoundException('챌린지를 찾을 수 없습니다.')

    const skip = (page - 1) * limit

    const whereCondition: any = { challengeId }
    if (status) {
      whereCondition.status = status
    }

    const [verifications, total] = await this.challengeVerificationRepository.findAndCount({
      where: whereCondition,
      relations: ['user'],
      order: { createdAt: 'DESC' },
      skip,
      take: limit
    })

    const totalPages = Math.ceil(total / limit)
    const hasNext = page < totalPages
    const hasPrev = page > 1

    const verificationData = await Promise.all(
      verifications.map(async (verification) => {
        const user = await this.userService.findOne(verification.userId)

        let reviewedAt: string | undefined
        let reviewer: any = null
        let rejectionReason: string | undefined

        if (verification.rejectionReason) {
          try {
            const reviewData = JSON.parse(verification.rejectionReason)
            reviewedAt = reviewData.reviewedAt
            rejectionReason = reviewData.message || verification.rejectionReason

            if (reviewData.reviewedById) {
              const reviewerUser = await this.userService.findOne(reviewData.reviewedById)
              reviewer = {
                id: reviewerUser.id,
                nickname: reviewerUser.nickname,
                reviewedAt: reviewData.reviewedAt
              }
            }
          } catch {
            rejectionReason = verification.rejectionReason
          }
        }

        return {
          verificationId: verification.id,
          challengeId: verification.challengeId,
          user: {
            id: user.id,
            nickname: user.nickname,
            profileImageUrl: user.profileImageUrl
          },
          createdAt: verification.createdAt.toISOString(),
          updatedAt: verification.updatedAt.toISOString(),
          status: verification.status,
          reviewedAt,
          rejectionReason
        }
      })
    )

    return {
      verifications: verificationData,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext,
        hasPrev
      }
    }
  }

  async getChallengeVerification(challengeId: number, verificationId: number): Promise<GetChallengeVerificationResDto> {
    const challenge = await this.challengeService.findOne(challengeId)
    if (!challenge) throw new NotFoundException('챌린지를 찾을 수 없습니다.')

    const verification = await this.challengeVerificationRepository.findOne({
      where: { id: verificationId, challengeId }
    })

    if (!verification) throw new NotFoundException('인증을 찾을 수 없습니다.')

    const user = await this.userService.findOne(verification.userId)

    let reviewer:
      | {
          id: number
          nickname: string
          reviewedAt: string
        }
      | undefined
    let rejectionReason: string | undefined

    if (verification.rejectionReason) {
      try {
        const reviewData = JSON.parse(verification.rejectionReason)
        rejectionReason = reviewData.message || verification.rejectionReason

        if (reviewData.reviewedById) {
          const reviewerUser = await this.userService.findOne(reviewData.reviewedById)
          reviewer = {
            id: reviewerUser.id,
            nickname: reviewerUser.nickname,
            reviewedAt: reviewData.reviewedAt
          }
        }
      } catch {
        rejectionReason = verification.rejectionReason
      }
    }

    return {
      verificationId: verification.id,
      challengeId: verification.challengeId,
      user: {
        id: user.id,
        nickname: user.nickname,
        profileImageUrl: user.profileImageUrl
      },
      createdAt: verification.createdAt.toISOString(),
      updatedAt: verification.updatedAt.toISOString(),
      status: verification.status,
      title: verification.title,
      content: verification.content,
      imageUrls: verification.imageUrls,
      reviewer,
      rejectionReason
    }
  }

  private calculateRequiredDays(challenge: Challenge): number {
    const start = new Date(challenge.startDate)
    const end = new Date(challenge.endDate)
    const diffTime = Math.abs(end.getTime() - start.getTime())
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1
  }

  private calculateExpectedDays(startDate: string, verificationFrequency: ChallengeVerificationFrequency): number {
    const start = new Date(startDate)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - start.getTime())
    const totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1

    switch (verificationFrequency) {
      case ChallengeVerificationFrequency.ONCE_A_DAY:
        return totalDays
      case ChallengeVerificationFrequency.EVERY_WEEKDAY:
        let weekdays = 0
        for (let i = 0; i < totalDays; i++) {
          const day = new Date(start)
          day.setDate(start.getDate() + i)
          const dayOfWeek = day.getDay()
          if (dayOfWeek !== 0 && dayOfWeek !== 6) weekdays++
        }
        return weekdays
      case ChallengeVerificationFrequency.ONCE_A_WEEK:
        return Math.ceil(totalDays / 7)
      case ChallengeVerificationFrequency.THREE_TIMES_A_WEEK:
        return Math.ceil((totalDays / 7) * 3)
      default:
        return totalDays
    }
  }

  async getMemberProgress(challengeId: number, userId: number): Promise<GetMemberProgressResDto> {
    const challenge = await this.challengeRepository.findOne({ where: { id: challengeId } })
    if (!challenge) throw new NotFoundException('챌린지가 존재하지 않습니다.')

    const member = await this.challengeMemberRepository.findOne({ where: { challengeId, userId } })
    if (!member) throw new ForbiddenException('챌린지 멤버만 진행 상황을 확인할 수 있습니다.')

    const user = await this.userService.findOne(userId)

    const totalRequiredDays = this.calculateRequiredDays(challenge)
    const expectedDays = this.calculateExpectedDays(challenge.startDate, challenge.verificationFrequency)

    const completedVerifications = await this.challengeVerificationRepository.count({
      where: {
        challengeId,
        userId,
        status: ChallengeVerificationStatus.APPROVED
      }
    })

    const todayVerification = await this.getTodayVerification(challengeId, userId, challenge.verificationFrequency)

    const progressPercentage =
      totalRequiredDays > 0 ? Number(((completedVerifications / totalRequiredDays) * 100).toFixed(2)) : 0
    const remainingDays = Math.max(0, totalRequiredDays - completedVerifications)

    let status: 'ON_TRACK' | 'BEHIND' | 'AHEAD' | 'COMPLETED'
    if (completedVerifications >= totalRequiredDays) {
      status = 'COMPLETED'
    } else if (completedVerifications >= expectedDays) {
      status = 'ON_TRACK'
    } else if (completedVerifications < expectedDays * 0.8) {
      status = 'BEHIND'
    } else {
      status = 'AHEAD'
    }

    return {
      message: 'Member progress retrieved successfully.',
      data: {
        userId: user.id,
        nickname: user.nickname,
        profileImageUrl: user.profileImageUrl,
        progressPercentage,
        totalRequiredDays,
        completedDays: completedVerifications,
        remainingDays,
        status,
        todayVerificationStatus: todayVerification?.status
      }
    }
  }

  async getChallengeMembersProgress(challengeId: number): Promise<GetChallengeMembersProgressResDto> {
    const challenge = await this.challengeRepository.findOne({ where: { id: challengeId } })
    if (!challenge) throw new NotFoundException('챌린지가 존재하지 않습니다.')

    const members = await this.challengeMemberRepository.find({
      where: { challengeId },
      relations: ['user']
    })

    const membersProgress = await Promise.all(
      members.map((member) => this.getMemberProgress(challengeId, member.userId))
    )

    const memberDataList = membersProgress.map((memberProgress) => memberProgress.data)

    const averageProgress =
      memberDataList.length > 0
        ? Number(
            (
              memberDataList.reduce((sum, member) => sum + member.progressPercentage, 0) / memberDataList.length
            ).toFixed(2)
          )
        : 0

    const activeMembers = memberDataList.filter((member) => member.status !== 'COMPLETED').length
    const completedMembers = memberDataList.filter((member) => member.status === 'COMPLETED').length

    const verifiedTodayCount = memberDataList.filter(
      (member) => member.todayVerificationStatus === ChallengeVerificationStatus.APPROVED
    ).length
    const pendingVerificationCount = memberDataList.filter(
      (member) => member.todayVerificationStatus === ChallengeVerificationStatus.PENDING
    ).length

    return {
      message: '챌린지 멤버 진행 상황이 조회되었습니다.',
      members: memberDataList,
      summary: {
        averageProgress,
        totalMembers: memberDataList.length,
        activeMembers,
        completedMembers,
        verifiedTodayCount,
        pendingVerificationCount
      }
    }
  }
}
