import { ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { In, Repository } from 'typeorm'
import { MemberType, ChallengeMember } from './challenge-member.entity'
import { Challenge } from '../challenge/challenge.entity'
import {
  ChallengeVerification,
  ChallengeVerificationStatus
} from '../challenge-verification/challenge-verification.entity'
import { IdParamsDto } from '@data/dto'
import { GetMembersReqDto } from './dto/req/get-members.req.dto'
import { GetMembersResDto } from './dto/res/get-members.res.dto'

@Injectable()
export class ChallengeMemberService {
  constructor(
    @InjectRepository(ChallengeMember)
    private memberRepository: Repository<ChallengeMember>,
    @InjectRepository(Challenge)
    private challengeRepository: Repository<Challenge>,
    @InjectRepository(ChallengeVerification)
    private verificationRepository: Repository<ChallengeVerification>
  ) {}

  async addMember(
    challengeId: number,
    userId: number,
    memberType: MemberType,
    position?: string
  ): Promise<IdParamsDto> {
    const existing = await this.memberRepository.findOne({ where: { challengeId, userId } })
    if (existing) throw new ConflictException('already_member')

    const member = new ChallengeMember({ challengeId, userId, memberType, position })
    await this.memberRepository.save(member)
    return { id: member.id }
  }

  async findAllByChallenge(challengeId: number, options: GetMembersReqDto): Promise<GetMembersResDto> {
    const { sort, order, start, perPage } = options

    const query = this.memberRepository
      .createQueryBuilder('m')
      .leftJoinAndSelect('m.user', 'u')
      .where('m."challengeId" = :challengeId', { challengeId })

    if (sort && order) {
      query.orderBy('m.joinedAt', order as 'ASC' | 'DESC')
    } else {
      query.orderBy('m.joinedAt', 'ASC')
    }

    const [members, total] = await query.skip(start).take(perPage).getManyAndCount()

    const memberIds = members.map((m) => m.userId)
    const verifications = await this.verificationRepository.find({
      where: {
        challengeId,
        userId: In(memberIds),
        status: ChallengeVerificationStatus.APPROVED
      }
    })

    const verificationCountMap = new Map<number, number>()
    verifications.forEach((v) => {
      const currentCount = verificationCountMap.get(v.userId) || 0
      verificationCountMap.set(v.userId, currentCount + 1)
    })

    const data = members.map((m) => ({
      id: m.id,
      userId: m.userId,
      memberType: m.memberType,
      position: m.position ?? null,
      joinedAt: m.joinedAt,
      isVerified: (verificationCountMap.get(m.userId) || 0) > 0,
      verificationCount: verificationCountMap.get(m.userId) || 0,
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

  async removeMember(challengeId: number, targetUserId: number, hostUserId: number): Promise<{ message: string }> {
    const challenge = await this.challengeRepository.findOne({ where: { id: challengeId } })
    if (!challenge) throw new NotFoundException()
    if (challenge.hostId !== hostUserId) throw new ForbiddenException()

    const member = await this.memberRepository.findOne({ where: { challengeId, userId: targetUserId } })
    if (!member) throw new NotFoundException()

    await this.memberRepository.delete({ id: member.id })
    return { message: '멤버가 제거되었습니다.' }
  }
}
