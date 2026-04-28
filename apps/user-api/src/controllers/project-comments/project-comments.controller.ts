import { Auth, Public, User } from '@data/decorators'
import { ProjectCommentService } from '@data/domain/project-comments'
import { PatchProjectCommentReqDto } from '@data/domain/project-comments/dto/req/patch-project-comment.req.dto'
import { PostProjectCommentReqDto } from '@data/domain/project-comments/dto/req/post-project-comment.req.dto'
import { GetProjectCommentsResDto } from '@data/domain/project-comments/dto/res/get-comments.res.dto'
import { GetMyCommentsResDto } from '@data/domain/project-comments/dto/res/get-my-comments.res.dto'
import { GetCommentsReqDto } from '@data/domain/project-comments/dto/req/get-comments.req.dto'
import { IdParamsDto } from '@data/dto'
import { Body, Controller, Delete, Get, HttpCode, Param, ParseIntPipe, Patch, Post, Query } from '@nestjs/common'
import {
  ApiConflictResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiResponse,
  ApiTags
} from '@nestjs/swagger'

@Auth({ type: 'user' })
@ApiTags('프로젝트 댓글')
@Controller()
export class ProjectCommentsController {
  constructor(private readonly projectCommentService: ProjectCommentService) {}

  @Post('projects/:projectId/comments')
  @ApiOperation({ summary: '댓글 작성' })
  @ApiResponse({ status: 201, type: IdParamsDto })
  @ApiNotFoundResponse({ description: 'not_found_project_info' })
  @ApiConflictResponse({ description: 'duplicate' })
  create(
    @User('id', ParseIntPipe) userId: number,
    @Param('projectId', ParseIntPipe) projectId: number,
    @Body() data: PostProjectCommentReqDto
  ): Promise<IdParamsDto> {
    return this.projectCommentService.create(projectId, userId, data)
  }

  @Public()
  @Get('projects/:projectId/comments')
  @ApiOperation({ summary: '프로젝트 댓글 목록 조회' })
  @ApiResponse({ status: 200, type: GetProjectCommentsResDto })
  @ApiNotFoundResponse({ description: 'not_found_project_info' })
  findAll(
    @Param('projectId', ParseIntPipe) projectId: number,
    @Query() params: GetCommentsReqDto
  ): Promise<GetProjectCommentsResDto> {
    return this.projectCommentService.findAllByProject(projectId, params)
  }

  @Get('projects/me/comments')
  @ApiOperation({ summary: '내가 작성한 댓글 목록 조회' })
  @ApiResponse({ status: 200, type: GetMyCommentsResDto })
  findMyComments(
    @User('id', ParseIntPipe) userId: number,
    @Query() params: GetCommentsReqDto
  ): Promise<GetMyCommentsResDto> {
    return this.projectCommentService.findAllByUser(userId, params)
  }

  @Patch('projects/:projectId/comments/:commentId')
  @HttpCode(204)
  @ApiOperation({ summary: '댓글 수정' })
  @ApiResponse({ status: 204 })
  @ApiNotFoundResponse({ description: 'not_found_comment_info' })
  @ApiForbiddenResponse({ description: 'forbidden_not_author' })
  update(
    @User('id', ParseIntPipe) userId: number,
    @Param('commentId', ParseIntPipe) commentId: number,
    @Body() data: PatchProjectCommentReqDto
  ): Promise<void> {
    return this.projectCommentService.update(commentId, userId, data)
  }

  @Delete('projects/:projectId/comments/:commentId')
  @HttpCode(204)
  @ApiOperation({ summary: '댓글 삭제' })
  @ApiResponse({ status: 204 })
  @ApiNotFoundResponse({ description: 'not_found_comment_info' })
  @ApiForbiddenResponse({ description: 'forbidden_not_author' })
  delete(@User('id', ParseIntPipe) userId: number, @Param('commentId', ParseIntPipe) commentId: number): Promise<void> {
    return this.projectCommentService.delete(commentId, userId)
  }
}
