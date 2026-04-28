import { Auth, User } from '@data/decorators'
import { ChallengeApplicationService } from '@data/domain/challenge-applications/challenge-application.service'
import { PatchApplicationRejectReqDto } from '@data/domain/challenge-applications/dto/req/patch-application-reject.req.dto'
import { PostApplicationReqDto } from '@data/domain/challenge-applications/dto/req/post-application.req.dto'
import { GetApplicationsResDto } from '@data/domain/challenge-applications/dto/res/get-applications.res.dto'
import { PatchApplicationResDto } from '@data/domain/challenge-applications/dto/res/patch-application.res.dto'
import { PostApplicationResDto } from '@data/domain/challenge-applications/dto/res/post-application.res.dto'
import { GetApplicationsReqDto } from '@data/domain/challenge-applications/dto/req/get-applications.req.dto'
import { Body, Controller, Get, HttpCode, Param, ParseIntPipe, Patch, Post, Query } from '@nestjs/common'
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiConflictResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiResponse,
  ApiTags
} from '@nestjs/swagger'
import { IdParamsDto } from '@data/dto/id-params.dto'

@Auth({ type: 'user' })
@ApiTags('챌린지 참여 관리')
@Controller('/challenges')
export class ChallengeApplicationsController {
  constructor(private readonly challengeApplicationService: ChallengeApplicationService) {}

  @Post('/:challengeId/applications')
  @ApiOperation({ summary: '챌린지 신청' })
  @ApiResponse({ status: 201, type: IdParamsDto })
  @ApiNotFoundResponse({ description: 'not_found_challenge_info' })
  @ApiForbiddenResponse({ description: 'host_cannot_apply' })
  @ApiConflictResponse({ description: 'already_applied' })
  @ApiBody({ type: PostApplicationReqDto, description: '챌린지 신청 정보 (githubUrl은 선택사항)' })
  apply(
    @User('id', ParseIntPipe) userId: number,
    @Param('challengeId', ParseIntPipe) challengeId: number,
    @Body() data: PostApplicationReqDto
  ): Promise<IdParamsDto> {
    return this.challengeApplicationService.apply(challengeId, userId, data)
  }

  @Get('/:challengeId/applications')
  @ApiOperation({ summary: '신청 목록 조회 (호스트 전용)' })
  @ApiResponse({ status: 200, type: GetApplicationsResDto })
  findAll(
    @User('id', ParseIntPipe) userId: number,
    @Param('challengeId', ParseIntPipe) challengeId: number,
    @Query() params: GetApplicationsReqDto
  ): Promise<GetApplicationsResDto> {
    return this.challengeApplicationService.findAllByChallenge(challengeId, userId, params)
  }

  @Patch('/applications/:applicationId/approve')
  @HttpCode(204)
  @ApiOperation({ summary: '신청 승인' })
  @ApiResponse({ status: 204 })
  approve(
    @User('id', ParseIntPipe) userId: number,
    @Param('applicationId', ParseIntPipe) applicationId: number
  ): Promise<void> {
    return this.challengeApplicationService.approve(applicationId, userId)
  }

  @Patch('/applications/:applicationId/reject')
  @HttpCode(204)
  @ApiOperation({ summary: '신청 거절' })
  @ApiResponse({ status: 204 })
  reject(
    @User('id', ParseIntPipe) userId: number,
    @Param('applicationId', ParseIntPipe) applicationId: number,
    @Body() data: PatchApplicationRejectReqDto
  ): Promise<void> {
    return this.challengeApplicationService.reject(applicationId, userId, data)
  }
}
