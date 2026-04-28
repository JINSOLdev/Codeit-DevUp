import { Auth, User } from '@data/decorators'
import { ChallengeLikedService } from '@data/domain/challenge-liked'
import { GetLikedResDto } from '@data/domain/challenge-liked/dto/res/get-liked.res.dto'
import { PostLikedResDto } from '@data/domain/challenge-liked/dto/res/post-liked.res.dto'
import { GetLikedReqDto } from '@data/domain/challenge-liked/dto/req/get-liked.req.dto'
import { Controller, Delete, Get, Param, ParseIntPipe, Post, Query } from '@nestjs/common'
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { IdParamsDto } from '@data/dto/id-params.dto'

@Auth({ type: 'user' })
@ApiTags('챌린지 찜하기')
@Controller('/challenges')
export class ChallengeLikedController {
  constructor(private readonly challengeLikedService: ChallengeLikedService) {}

  @Post('/:challengeId/liked')
  @ApiOperation({ summary: '찜하기' })
  @ApiResponse({ status: 201, type: IdParamsDto })
  like(
    @User('id', ParseIntPipe) userId: number,
    @Param('challengeId', ParseIntPipe) challengeId: number
  ): Promise<IdParamsDto> {
    return this.challengeLikedService.like(challengeId, userId)
  }

  @Delete('/:challengeId/liked')
  @ApiOperation({ summary: '찜하기 취소' })
  unlike(@User('id', ParseIntPipe) userId: number, @Param('challengeId', ParseIntPipe) challengeId: number) {
    return this.challengeLikedService.unlike(challengeId, userId)
  }

  @Get('/me/liked')
  @ApiOperation({ summary: '내가 찜한 챌린지 목록' })
  @ApiResponse({ status: 200, type: GetLikedResDto })
  findMyLiked(@User('id', ParseIntPipe) userId: number, @Query() params: GetLikedReqDto): Promise<GetLikedResDto> {
    return this.challengeLikedService.findAllByUser(userId, params)
  }
}
