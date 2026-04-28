import { Auth, User } from '@data/decorators'
import { ProjectLikedService } from '@data/domain/project-liked'
import { GetProjectLikedResDto } from '@data/domain/project-liked/dto/res/get-liked.res.dto'
import { GetLikedReqDto } from '@data/domain/project-liked/dto/req/get-liked.req.dto'
import { IdParamsDto } from '@data/dto'
import { Controller, Delete, Get, HttpCode, Param, ParseIntPipe, Post, Query } from '@nestjs/common'
import { ApiConflictResponse, ApiNotFoundResponse, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'

@Auth({ type: 'user' })
@ApiTags('프로젝트 찜하기')
@Controller()
export class ProjectLikedController {
  constructor(private readonly projectLikedService: ProjectLikedService) {}

  @Post('projects/:projectId/liked')
  @ApiOperation({ summary: '찜하기' })
  @ApiResponse({ status: 201, type: IdParamsDto })
  @ApiNotFoundResponse({ description: 'not_found_project_info' })
  @ApiConflictResponse({ description: 'already_liked | duplicate' })
  like(
    @User('id', ParseIntPipe) userId: number,
    @Param('projectId', ParseIntPipe) projectId: number
  ): Promise<IdParamsDto> {
    return this.projectLikedService.like(projectId, userId)
  }

  @Delete('projects/:projectId/liked')
  @HttpCode(204)
  @ApiOperation({ summary: '찜하기 취소' })
  @ApiResponse({ status: 204 })
  @ApiNotFoundResponse({ description: 'not_found_liked_info' })
  unlike(@User('id', ParseIntPipe) userId: number, @Param('projectId', ParseIntPipe) projectId: number): Promise<void> {
    return this.projectLikedService.unlike(projectId, userId)
  }

  @Get('projects/me/liked')
  @ApiOperation({ summary: '내가 찜한 프로젝트 목록' })
  @ApiResponse({ status: 200, type: GetProjectLikedResDto })
  findMyLiked(
    @User('id', ParseIntPipe) userId: number,
    @Query() params: GetLikedReqDto
  ): Promise<GetProjectLikedResDto> {
    return this.projectLikedService.findAllByUser(userId, params)
  }
}
