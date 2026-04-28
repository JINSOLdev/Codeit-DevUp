import { Auth, User } from '@data/decorators'
import { ChallengeBookmarkedService } from '@data/domain/challenge-bookmarked'
import { GetBookmarkedResDto } from '@data/domain/challenge-bookmarked/dto/res/get-bookmarked.res.dto'
import { GetBookmarkedReqDto } from '@data/domain/challenge-bookmarked/dto/req/get-bookmarked.req.dto'
import { Controller, Delete, Get, Param, ParseIntPipe, Post, Query } from '@nestjs/common'
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { IdParamsDto } from '@data/dto/id-params.dto'

@Auth({ type: 'user' })
@ApiTags('챌린지 북마크')
@Controller('/challenges')
export class ChallengeBookmarkedController {
  constructor(private readonly challengeBookmarkedService: ChallengeBookmarkedService) {}

  @Post('/:challengeId/bookmarked')
  @ApiOperation({ summary: '북마크 추가' })
  @ApiResponse({ status: 201, type: IdParamsDto })
  bookmark(
    @User('id', ParseIntPipe) userId: number,
    @Param('challengeId', ParseIntPipe) challengeId: number
  ): Promise<IdParamsDto> {
    return this.challengeBookmarkedService.bookmark(challengeId, userId)
  }

  @Delete('/:challengeId/bookmarked')
  @ApiOperation({ summary: '북마크 취소' })
  unbookmark(@User('id', ParseIntPipe) userId: number, @Param('challengeId', ParseIntPipe) challengeId: number) {
    return this.challengeBookmarkedService.unbookmark(challengeId, userId)
  }

  @Get('/me/bookmarked')
  @ApiOperation({ summary: '내 북마크 목록' })
  @ApiResponse({ status: 200, type: GetBookmarkedResDto })
  findMyBookmarked(
    @User('id', ParseIntPipe) userId: number,
    @Query() params: GetBookmarkedReqDto
  ): Promise<GetBookmarkedResDto> {
    return this.challengeBookmarkedService.findAllByUser(userId, params)
  }
}
