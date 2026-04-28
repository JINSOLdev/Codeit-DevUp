import { Auth, Public, User } from '@data/decorators'
import { ChallengeService, PatchChallengeReqDto } from '@data/domain/challenge'
import { GetChallengesReqDto } from '@data/domain/challenge/dto/req/get-challenges.req.dto'
import { PostChallengeReqDto } from '@data/domain/challenge/dto/req/post-challenge.req.dto'
import { GetChallengeResDto } from '@data/domain/challenge/dto/res/get-challenge.res.dto'
import { GetChallengesResDto } from '@data/domain/challenge/dto/res/get-challenges.res.dto'
import { PatchChallengeResDto } from '@data/domain/challenge/dto/res/patch-challenge.res.dto'
import { PostChallengeCreateResponseDto } from '@data/domain/challenge/dto/res/post-challenge-create-res.dto'
import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query } from '@nestjs/common'
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'

@ApiTags('챌린지')
@Controller('challenges')
export class ChallengeController {
  constructor(private readonly challengeService: ChallengeService) {}

  @Auth({ type: 'user' })
  @Post()
  @ApiOperation({ summary: '챌린지 생성' })
  @ApiResponse({ status: 201, type: PostChallengeCreateResponseDto })
  create(
    @User('id', ParseIntPipe) userId: number,
    @Body() data: PostChallengeReqDto
  ): Promise<PostChallengeCreateResponseDto> {
    return this.challengeService.create(userId, data)
  }

  @Public()
  @Get()
  @ApiOperation({ summary: '챌린지 목록 조회' })
  @ApiResponse({ status: 200, type: GetChallengesResDto })
  findAll(@Query() params: GetChallengesReqDto, @User() user: any): Promise<GetChallengesResDto> {
    return this.challengeService.findAll(params, user?.id)
  }

  @Public()
  @Get(':challengeId')
  @ApiOperation({ summary: '챌린지 상세 조회' })
  @ApiResponse({ status: 200, type: GetChallengeResDto })
  async findOne(
    @Param('challengeId', ParseIntPipe) challengeId: number,
    @User() user: any
  ): Promise<GetChallengeResDto> {
    await this.challengeService.incrementViewCount(challengeId)
    return this.challengeService.findOne(challengeId, user?.id)
  }

  @Auth({ type: 'user' })
  @Patch(':challengeId')
  @ApiOperation({ summary: '챌린지 수정' })
  update(
    @User('id', ParseIntPipe) userId: number,
    @Param('challengeId', ParseIntPipe) challengeId: number,
    @Body() data: PatchChallengeReqDto
  ): Promise<PatchChallengeResDto> {
    return this.challengeService.update(challengeId, userId, data)
  }

  @Auth({ type: 'user' })
  @Delete(':challengeId')
  @ApiOperation({ summary: '챌린지 삭제' })
  delete(@User('id', ParseIntPipe) userId: number, @Param('challengeId', ParseIntPipe) challengeId: number) {
    return this.challengeService.delete(challengeId, userId)
  }
}
