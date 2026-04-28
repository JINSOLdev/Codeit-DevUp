import { Auth, User } from '@data/decorators'
import { ChallengeVerificationService } from '@data/domain/challenge-verification'
import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Res } from '@nestjs/common'
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { PostChallengeVerificationReqDto } from '@data/domain/challenge-verification/dto/req/post-challenge-verification.req.dto'
import { PatchChallengeVerificationReqDto } from '@data/domain/challenge-verification/dto/req/patch-challenge-verification.req.dto'
import { UpdateVerificationStatusReqDto } from '@data/domain/challenge-verification/dto/req/update-verification-status.req.dto'
import { PostChallengeVerificationResDto } from '@data/domain/challenge-verification/dto/res/post-challenge-verification.res.dto'
import { PatchChallengeVerificationResDto } from '@data/domain/challenge-verification/dto/res/patch-challenge-verification.res.dto'
import { UpdateVerificationStatusResDto } from '@data/domain/challenge-verification/dto/res/update-verification-status.res.dto'
import { DeleteChallengeVerificationResDto } from '@data/domain/challenge-verification/dto/res/delete-challenge-verification.res.dto'
import { GetMyVerificationStatusResDto } from '@data/domain/challenge-verification/dto/res/get-my-verification-status.res.dto'
import { GetChallengeVerificationsResDto } from '@data/domain/challenge-verification/dto/res/get-challenge-verifications.res.dto'
import { GetChallengeVerificationResDto } from '@data/domain/challenge-verification/dto/res/get-challenge-verification.res.dto'
import {
  GetMemberProgressResDto,
  MemberProgressData
} from '@data/domain/challenge-verification/dto/res/get-member-progress.res.dto'
import { GetChallengeMembersProgressResDto } from '@data/domain/challenge-verification/dto/res/get-challenge-members-progress.res.dto'

@ApiTags('챌린지 인증')
@Controller('challenges/:challengeId/verifications')
export class ChallengeVerificationsController {
  constructor(private readonly challengeVerificationService: ChallengeVerificationService) {}

  @Auth({ type: 'user' })
  @Post()
  @ApiOperation({ summary: '챌린지 인증 생성' })
  @ApiResponse({ status: 201, type: PostChallengeVerificationResDto })
  @ApiResponse({ status: 403, description: '챌린지 참여자만 인증할 수 있습니다.' })
  @ApiResponse({ status: 409, description: '이미 인증되었습니다.' })
  async create(
    @User('id') userId: number,
    @Param('challengeId') challengeId: number,
    @Body() data: PostChallengeVerificationReqDto
  ): Promise<PostChallengeVerificationResDto> {
    const result = await this.challengeVerificationService.create(Number(userId), Number(challengeId), data)

    return {
      message: '인증이 등록되었습니다.',
      data: {
        verificationId: result.verificationId,
        challengeId: result.challengeId,
        user: {
          id: result.user.id,
          nickname: result.user.nickname,
          profileImageUrl: result.user.profileImageUrl
        },
        title: result.title,
        content: result.content,
        imageUrls: result.imageUrls,
        status: result.status,
        createdAt: result.createdAt
      }
    }
  }

  @Auth({ type: 'user' })
  @Patch(':verificationId')
  @ApiOperation({ summary: '챌린지 인증 수정' })
  @ApiResponse({ status: 200, type: PatchChallengeVerificationResDto })
  @ApiResponse({ status: 403, description: '자신이 작성한 인증만 수정할 수 있습니다.' })
  @ApiResponse({ status: 404, description: '인증이 존재하지 않습니다.' })
  async update(
    @User('id') userId: number,
    @Param('challengeId') challengeId: number,
    @Param('verificationId') verificationId: number,
    @Body() data: PatchChallengeVerificationReqDto
  ): Promise<PatchChallengeVerificationResDto> {
    const result = await this.challengeVerificationService.update(
      Number(userId),
      Number(challengeId),
      Number(verificationId),
      data
    )

    return {
      message: '인증이 수정되었습니다.',
      data: {
        verificationId: result.verificationId,
        challengeId: result.challengeId,
        title: result.title,
        content: result.content,
        imageUrls: result.imageUrls,
        status: result.status,
        updatedAt: result.updatedAt
      }
    }
  }

  @Auth({ type: 'user' })
  @Delete(':verificationId')
  @ApiOperation({ summary: '챌린지 인증 삭제' })
  @ApiResponse({ status: 200, type: DeleteChallengeVerificationResDto })
  @ApiResponse({ status: 403, description: '자신이 작성한 인증만 삭제할 수 있습니다.' })
  @ApiResponse({ status: 404, description: '인증이 존재하지 않습니다.' })
  async delete(
    @User('id') userId: number,
    @Param('challengeId') challengeId: number,
    @Param('verificationId') verificationId: number
  ): Promise<DeleteChallengeVerificationResDto> {
    await this.challengeVerificationService.delete(Number(userId), Number(challengeId), Number(verificationId))

    return {
      message: '인증이 삭제되었습니다.'
    }
  }

  @Auth({ type: 'user' })
  @Patch(':verificationId/status')
  @ApiOperation({ summary: '챌린지 인증 상태 변경 (승인/거절)' })
  @ApiResponse({ status: 200, type: UpdateVerificationStatusResDto })
  @ApiResponse({ status: 403, description: '이미 처리된 인증이거나 권한이 없습니다.' })
  @ApiResponse({ status: 404, description: '인증이 존재하지 않습니다.' })
  async updateStatus(
    @User('id') reviewerId: number,
    @Param('challengeId') challengeId: number,
    @Param('verificationId') verificationId: number,
    @Body() data: UpdateVerificationStatusReqDto
  ): Promise<UpdateVerificationStatusResDto> {
    const result = await this.challengeVerificationService.updateStatus(
      reviewerId,
      challengeId,
      verificationId,
      data.status,
      data.message
    )

    return {
      message: '인증 상태가 변경되었습니다.',
      data: {
        verificationId: result.verificationId,
        status: result.status,
        reviewedAt: result.reviewedAt,
        reviewedBy: result.reviewedBy
      }
    } satisfies UpdateVerificationStatusResDto
  }

  @Auth({ type: 'user' })
  @Get()
  @ApiOperation({ summary: '챌린지 인증 전체 조회' })
  @ApiResponse({ status: 200, type: GetChallengeVerificationsResDto })
  @ApiResponse({ status: 404, description: '챌린지를 찾을 수 없습니다.' })
  async getChallengeVerifications(
    @Param('challengeId') challengeId: number,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '20',
    @Query('status') status?: string
  ): Promise<GetChallengeVerificationsResDto> {
    const pageNum = parseInt(page, 10) || 1
    const limitNum = parseInt(limit, 10) || 20
    const statusEnum = status as any

    const result = await this.challengeVerificationService.getChallengeVerifications(
      challengeId,
      pageNum,
      limitNum,
      statusEnum
    )

    return {
      message: '챌린지 인증 전체 조회가 완료되었습니다.',
      data: result.verifications.map((verification) => ({
        verificationId: verification.verificationId,
        challengeId: verification.challengeId,
        user: {
          id: verification.user.id,
          nickname: verification.user.nickname,
          profileImageUrl: verification.user.profileImageUrl
        },
        createdAt: verification.createdAt,
        updatedAt: verification.updatedAt,
        status: verification.status,
        reviewedAt: verification.reviewedAt,
        rejectionReason: verification.rejectionReason
      })),
      meta: {
        page: result.pagination.page,
        limit: result.pagination.limit,
        total: result.pagination.total,
        totalPages: result.pagination.totalPages,
        hasNext: result.pagination.hasNext,
        hasPrev: result.pagination.hasPrev
      }
    }
  }

  @Auth({ type: 'user' })
  @Get(':verificationId')
  @ApiOperation({ summary: '챌린지 인증 상세 조회' })
  @ApiResponse({ status: 200, type: GetChallengeVerificationResDto })
  @ApiResponse({ status: 404, description: '챌린지 또는 인증을 찾을 수 없습니다.' })
  async getChallengeVerification(
    @Param('challengeId') challengeId: number,
    @Param('verificationId') verificationId: number
  ): Promise<GetChallengeVerificationResDto> {
    const result = await this.challengeVerificationService.getChallengeVerification(challengeId, verificationId)

    return {
      message: '챌린지 인증 상세 조회가 완료되었습니다.',
      data: {
        verificationId: result.verificationId,
        challengeId: result.challengeId,
        user: {
          id: result.user.id,
          nickname: result.user.nickname,
          profileImageUrl: result.user.profileImageUrl
        },
        createdAt: result.createdAt,
        updatedAt: result.updatedAt,
        status: result.status,
        title: result.title,
        content: result.content,
        imageUrls: result.imageUrls,
        reviewer: result.reviewer,
        rejectionReason: result.rejectionReason
      }
    }
  }

  @Auth({ type: 'user' })
  @Get('me/status')
  @ApiOperation({ summary: '내 인증 가능 여부 조회' })
  @ApiResponse({ status: 200, type: GetMyVerificationStatusResDto })
  @ApiResponse({ status: 403, description: '챌린지 참여자만 인증 가능 여부를 확인할 수 있습니다.' })
  @ApiResponse({ status: 404, description: '챌린지가 존재하지 않습니다.' })
  async getMyVerificationStatus(
    @User('id') userId: number,
    @Param('challengeId') challengeId: number
  ): Promise<GetMyVerificationStatusResDto> {
    const result = await this.challengeVerificationService.getMyVerificationStatus(userId, challengeId)

    return {
      message: '오늘 인증을 작성할 수 있습니다.',
      challengeId: result.challengeId,
      userId: result.userId,
      verificationFrequency: result.verificationFrequency,
      myVerificationStatus: result.myVerificationStatus,
      verifiedInCurrentCycle: result.verifiedInCurrentCycle,
      canCreate: result.canCreate,
      canEdit: result.canEdit,
      canDelete: result.canDelete,
      statusMessage: result.message
    }
  }

  @Auth({ type: 'user' })
  @Get('me/progress')
  @ApiOperation({ summary: '내 인증 진행 상황' })
  @ApiResponse({ status: 200, type: GetMemberProgressResDto })
  @ApiResponse({ status: 403, description: '챌린지 멤버만 진행 상황을 확인할 수 있습니다.' })
  @ApiResponse({ status: 404, description: '챌린지가 존재하지 않습니다.' })
  async getMyProgress(
    @User('id') userId: number,
    @Param('challengeId') challengeId: number,
    @Res() res: any
  ): Promise<void> {
    const result = await this.challengeVerificationService.getMemberProgress(challengeId, userId)

    const response = {
      message: result.message,
      data: {
        userId: result.data.userId,
        nickname: result.data.nickname,
        profileImageUrl: result.data.profileImageUrl,
        progressPercentage: result.data.progressPercentage,
        totalRequiredDays: result.data.totalRequiredDays,
        completedDays: result.data.completedDays,
        remainingDays: result.data.remainingDays,
        status: result.data.status,
        todayVerificationStatus: result.data.todayVerificationStatus
      }
    }

    res.code(200).send(response)
  }

  @Auth({ type: 'user' })
  @Get('members/progress')
  @ApiOperation({ summary: '챌린지 모든 멤버의 진행률' })
  @ApiResponse({ status: 200, type: GetChallengeMembersProgressResDto })
  @ApiResponse({ status: 403, description: '챌린지 멤버만 진행률을 확인할 수 있습니다.' })
  @ApiResponse({ status: 404, description: '챌린지를 찾을 수 없습니다.' })
  async getChallengeMembersProgress(
    @User('id') userId: number,
    @Param('challengeId') challengeId: number
  ): Promise<GetChallengeMembersProgressResDto> {
    const result = await this.challengeVerificationService.getChallengeMembersProgress(challengeId)

    return result
  }
}
