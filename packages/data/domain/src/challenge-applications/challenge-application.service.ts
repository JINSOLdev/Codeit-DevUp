import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException
} from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { DataSource, Repository } from 'typeorm'
import { ApplicationStatus, ChallengeApplication } from './challenge-application.entity'
import { Challenge, ChallengeJoinType, ChallengeStatus } from '../challenge/challenge.entity'
import { ChallengeMember, MemberType } from '../challenge-member/challenge-member.entity'
import { ChallengeEventPublisher } from '../event-emitter/challenge-event/challenge-event.publisher'
import { ChallengeEventType } from '../event-emitter/challenge-event/types/event.types'
import { GetApplicationsReqDto } from './dto/req/get-applications.req.dto'
import { PostApplicationReqDto } from './dto/req/post-application.req.dto'
import { PatchApplicationRejectReqDto } from './dto/req/patch-application-reject.req.dto'
import { PostApplicationResDto } from './dto/res/post-application.res.dto'
import { GetApplicationsResDto } from './dto/res/get-applications.res.dto'
import { PatchApplicationResDto } from './dto/res/patch-application.res.dto'
import { IdParamsDto } from '@data/dto'

@Injectable()
export class ChallengeApplicationService {
  constructor(
    private dataSource: DataSource,
    @InjectRepository(ChallengeApplication)
    private applicationRepository: Repository<ChallengeApplication>,
    @InjectRepository(Challenge)
    private challengeRepository: Repository<Challenge>,
    @InjectRepository(ChallengeMember)
    private memberRepository: Repository<ChallengeMember>,
    private eventPublisher: ChallengeEventPublisher
  ) {}

  async apply(challengeId: number, userId: number, data: PostApplicationReqDto): Promise<IdParamsDto> {
    const { name, githubUrl, motivation } = data

    const challenge = await this.challengeRepository.findOne({ where: { id: challengeId } })
    if (!challenge) throw new NotFoundException()

    if (challenge.hostId === userId) throw new ForbiddenException('host_cannot_apply')

    const existing = await this.applicationRepository.findOne({ where: { challengeId: challenge.id, userId } })
    if (existing) throw new ConflictException('already_applied')

    const existingMember = await this.memberRepository.findOne({ where: { challengeId: challenge.id, userId } })
    if (existingMember) throw new ConflictException('already_joined')

    const processedGithubUrl = githubUrl && githubUrl.trim() ? githubUrl.trim() : null

    const queryRunner = this.dataSource.createQueryRunner()
    await queryRunner.connect()
    await queryRunner.startTransaction()

    try {
      const lockedChallenge = await queryRunner.manager.findOne(Challenge, {
        where: { id: challenge.id },
        lock: { mode: 'pessimistic_write' }
      })

      const currentMemberCount = await queryRunner.manager.count(ChallengeMember, {
        where: { challengeId: challenge.id }
      })

      if (currentMemberCount >= lockedChallenge.maxParticipants) {
        throw new BadRequestException('challenge_full')
      }

      if (lockedChallenge.joinType === ChallengeJoinType.INSTANT) {
        await queryRunner.manager.save(
          ChallengeMember,
          new ChallengeMember({
            challengeId: challenge.id,
            userId,
            memberType: MemberType.MEMBER
          })
        )

        await queryRunner.manager.save(
          ChallengeApplication,
          new ChallengeApplication({
            name,
            githubUrl: processedGithubUrl,
            motivation,
            challengeId: challenge.id,
            userId,
            status: ApplicationStatus.APPROVED
          })
        )

        if (currentMemberCount + 1 >= challenge.maxParticipants) {
          await queryRunner.manager.update(
            Challenge,
            { id: challenge.id },
            { status: ChallengeStatus.RECRUITMENT_CLOSED }
          )
        }
      } else {
        await queryRunner.manager.save(
          ChallengeApplication,
          new ChallengeApplication({
            name,
            githubUrl: processedGithubUrl,
            motivation,
            challengeId: challenge.id,
            userId
          })
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
      type: ChallengeEventType.APPLICATION_SENT,
      metadata: {
        applicationId: challengeId, 
        challengeId: challenge.id,
        challengeTitle: challenge.title,
        hostId: challenge.hostId,
        applicantUserId: userId,
        applicantName: name
      }
    })

    return { id: challengeId }
  }
  async findAllByChallenge(
    challengeId: number,
    hostUserId: number,
    options: GetApplicationsReqDto
  ): Promise<GetApplicationsResDto> {
    const { sort, order, start, perPage } = options

    const challenge = await this.challengeRepository.findOne({ where: { id: challengeId } })
    if (!challenge) throw new NotFoundException()
    if (challenge.hostId !== hostUserId) throw new ForbiddenException()

    const query = this.applicationRepository
      .createQueryBuilder('application')
      .leftJoinAndSelect('application.user', 'user')
      .where('application.challengeId = :challengeId', { challengeId })
      .select([
        'application.id',
        'application.userId',
        'application.githubUrl',
        'application.motivation',
        'application.status',
        'application.createdAt',
        'user.nickname',
        'user.profileImageUrl'
      ])
    if (sort && order) {
      query.orderBy(`application.${sort}`, order as 'ASC' | 'DESC')
    } else {
      query.orderBy('application.createdAt', 'DESC')
    }

    const [data, total] = await query.skip(start).take(perPage).getManyAndCount()

    // Transform the data to include user object
    const transformedData = data.map((application) => ({
      ...application,
      user: {
        nickname: application.user.nickname,
        profileImageUrl: application.user.profileImageUrl
      }
    }))

    return { data: transformedData, total }
  }

  async approve(applicationId: number, hostUserId: number): Promise<void> {
    const { application, challenge } = await this.getApplicationWithChallengeGuard(applicationId, hostUserId)

    const queryRunner = this.dataSource.createQueryRunner()
    await queryRunner.connect()
    await queryRunner.startTransaction()

    try {
      // 동시 approve 요청 직렬화를 위해 challenge 행 락
      const lockedChallenge = await queryRunner.manager.findOne(Challenge, {
        where: { id: challenge.id },
        lock: { mode: 'pessimistic_write' }
      })

      const currentMemberCount = await queryRunner.manager.count(ChallengeMember, {
        where: { challengeId: application.challengeId }
      })

      if (currentMemberCount >= lockedChallenge.maxParticipants) {
        if (lockedChallenge.status === ChallengeStatus.RECRUITING) {
          await queryRunner.manager.update(
            Challenge,
            { id: lockedChallenge.id },
            { status: ChallengeStatus.RECRUITMENT_CLOSED }
          )
        }
        throw new BadRequestException('challenge_full')
      }

      await queryRunner.manager.update(
        ChallengeApplication,
        { id: application.id },
        { status: ApplicationStatus.APPROVED }
      )

      await queryRunner.manager.save(
        ChallengeMember,
        new ChallengeMember({
          challengeId: application.challengeId,
          userId: application.userId,
          memberType: MemberType.MEMBER
        })
      )

      if (
        lockedChallenge.status === ChallengeStatus.RECRUITING &&
        currentMemberCount + 1 >= lockedChallenge.maxParticipants
      ) {
        await queryRunner.manager.update(
          Challenge,
          { id: lockedChallenge.id },
          { status: ChallengeStatus.RECRUITMENT_CLOSED }
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
      type: ChallengeEventType.APPLICATION_RESPONDED,
      metadata: {
        applicationId: application.id,
        challengeId: challenge.id,
        challengeTitle: challenge.title,
        applicantUserId: application.userId,
        applicantName: application.name,
        hostUserId,
        status: 'APPROVED'
      }
    })
  }

  async reject(applicationId: number, hostUserId: number, data: PatchApplicationRejectReqDto): Promise<void> {
    const { reasonCategory, reasonDetail } = data
    const { application, challenge } = await this.getApplicationWithChallengeGuard(applicationId, hostUserId)

    await this.applicationRepository.update(
      { id: applicationId },
      { status: ApplicationStatus.REJECTED, reasonCategory, reasonDetail }
    )

    this.eventPublisher.publish({
      type: ChallengeEventType.APPLICATION_RESPONDED,
      metadata: {
        applicationId: application.id,
        challengeId: challenge.id,
        challengeTitle: challenge.title,
        applicantUserId: application.userId,
        applicantName: application.name,
        hostUserId,
        status: 'REJECTED'
      }
    })
  }

  private async getApplicationWithChallengeGuard(applicationId: number, hostUserId: number) {
    const application = await this.applicationRepository.findOne({ where: { id: applicationId } })
    if (!application) throw new NotFoundException()

    const challenge = await this.challengeRepository.findOne({ where: { id: application.challengeId } })
    if (!challenge) throw new NotFoundException()
    if (challenge.hostId !== hostUserId) throw new ForbiddenException()
    if (application.status !== ApplicationStatus.PENDING) throw new ConflictException('already_processed')

    return { application, challenge }
  }
}
