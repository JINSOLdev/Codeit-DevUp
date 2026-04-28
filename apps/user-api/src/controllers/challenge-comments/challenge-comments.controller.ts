import { Auth, Public, User } from '@data/decorators'
import { ChallengeCommentService } from '@data/domain/challenge-comments'
import { PatchChallengeCommentReqDto } from '@data/domain/challenge-comments/dto/req/patch-challenge-comment.req.dto'
import { PostChallengeCommentReqDto } from '@data/domain/challenge-comments/dto/req/post-challenge-comment.req.dto'
import { PostChallengeCommentResDto } from '@data/domain/challenge-comments/dto/res/post-challenge-comment.res.dto'
import { PatchChallengeCommentResDto } from '@data/domain/challenge-comments/dto/res/patch-challenge-comment.res.dto'
import { DeleteChallengeCommentResDto } from '@data/domain/challenge-comments/dto/res/delete-comment.res.dto'
import { GetCommentsResDto } from '@data/domain/challenge-comments/dto/res/get-comments.res.dto'
import { GetCommentsReqDto } from '@data/domain/challenge-comments/dto/req/get-comments.req.dto'
import { IdParamsDto } from '@data/dto'
import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query } from '@nestjs/common'
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'

@ApiTags('챌린지 댓글')
@Controller('challenges')
export class ChallengeCommentsController {
  constructor(private readonly challengeCommentService: ChallengeCommentService) {}

  @Auth({ type: 'user' })
  @Post('/:challengeId/comments')
  @ApiOperation({ summary: '댓글 작성' })
  @ApiResponse({ status: 201, type: PostChallengeCommentResDto })
  create(
    @User('id', ParseIntPipe) userId: number,
    @Param('challengeId', ParseIntPipe) challengeId: number,
    @Body() data: PostChallengeCommentReqDto
  ): Promise<PostChallengeCommentResDto> {
    return this.challengeCommentService.create(challengeId, userId, data)
  }

  @Public()
  @Get('/:challengeId/comments')
  @ApiOperation({ summary: '댓글 목록 조회' })
  @ApiResponse({ status: 200, type: GetCommentsResDto })
  findAll(
    @Param('challengeId', ParseIntPipe) challengeId: number,
    @Query() params: GetCommentsReqDto
  ): Promise<GetCommentsResDto> {
    return this.challengeCommentService.findAllByChallenge(challengeId, params)
  }

  @Auth({ type: 'user' })
  @Patch('/:challengeId/comments/:commentId')
  @ApiOperation({ summary: '댓글 수정' })
  @ApiResponse({ status: 200, type: PatchChallengeCommentResDto })
  update(
    @User('id', ParseIntPipe) userId: number,
    @Param('challengeId', ParseIntPipe) challengeId: number,
    @Param('commentId', ParseIntPipe) commentId: number,
    @Body() data: PatchChallengeCommentReqDto
  ): Promise<PatchChallengeCommentResDto> {
    return this.challengeCommentService.update(challengeId, commentId, userId, data)
  }

  @Auth({ type: 'user' })
  @Delete('/:challengeId/comments/:commentId')
  @ApiOperation({ summary: '댓글 삭제' })
  @ApiResponse({ status: 200, type: DeleteChallengeCommentResDto })
  delete(
    @User('id', ParseIntPipe) userId: number,
    @Param('challengeId', ParseIntPipe) challengeId: number,
    @Param('commentId', ParseIntPipe) commentId: number
  ): Promise<DeleteChallengeCommentResDto> {
    return this.challengeCommentService.delete(challengeId, commentId, userId)
  }
}
