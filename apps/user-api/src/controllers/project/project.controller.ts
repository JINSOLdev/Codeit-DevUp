import { Auth, Public, User } from '@data/decorators'
import { ProjectService } from '@data/domain/project'
import { GetProjectsReqDto } from '@data/domain/project/dto/req/get-projects.req.dto'
import { PatchProjectReqDto } from '@data/domain/project/dto/req/patch-project.req.dto'
import { PostProjectReqDto } from '@data/domain/project/dto/req/post-project.req.dto'
import { GetProjectResDto } from '@data/domain/project/dto/res/get-project.res.dto'
import { GetProjectsResDto } from '@data/domain/project/dto/res/get-projects.res.dto'
import { IdParamsDto } from '@data/dto'
import { Body, Controller, Delete, Get, HttpCode, Param, ParseIntPipe, Patch, Post, Query, Req } from '@nestjs/common'
import type { FastifyRequest } from 'fastify'
import { ApiNotFoundResponse, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'

@Auth({ type: 'user' })
@ApiTags('프로젝트')
@Controller('projects')
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @Post()
  @ApiOperation({ summary: '프로젝트 모집글 생성' })
  @ApiResponse({ status: 201, type: IdParamsDto })
  @ApiNotFoundResponse({ description: 'not_found_user_info' })
  create(@User('id', ParseIntPipe) userId: number, @Body() data: PostProjectReqDto): Promise<IdParamsDto> {
    return this.projectService.create(userId, data)
  }

  @Public()
  @Get()
  @ApiOperation({ summary: '프로젝트 목록 조회 (로그인 시 liked 포함)' })
  @ApiResponse({ status: 200, type: GetProjectsResDto })
  findAll(@Query() params: GetProjectsReqDto, @User() user: any): Promise<GetProjectsResDto> {
    return this.projectService.findAll(params, user?.id)
  }

  @Public()
  @Get(':projectId')
  @ApiOperation({ summary: '프로젝트 상세 조회 (로그인 시 liked 포함)' })
  @ApiResponse({ status: 200, type: GetProjectResDto })
  @ApiNotFoundResponse({ description: 'not_found_project_info' })
  findOne(
    @Param('projectId', ParseIntPipe) projectId: number,
    @User() user: any,
    @Req() req: FastifyRequest
  ): Promise<GetProjectResDto> {
    const ip =
      (req.headers['x-real-ip'] as string) ?? (req.headers['x-forwarded-for'] as string)?.split(',')[0].trim() ?? req.ip
    return this.projectService.findOne(projectId, user?.id, ip)
  }

  @Patch(':projectId')
  @HttpCode(204)
  @ApiOperation({ summary: '프로젝트 수정 (호스트 전용)' })
  @ApiResponse({ status: 204 })
  @ApiNotFoundResponse({ description: 'not_found_project_info' })
  @ApiResponse({ status: 403, description: 'forbidden_not_host' })
  @ApiResponse({
    status: 400,
    description:
      'recruiting: recruitEndDate must be today or later. | recruitment_closed: recruitEndDate must be before today.'
  })
  update(
    @User('id', ParseIntPipe) userId: number,
    @Param('projectId', ParseIntPipe) projectId: number,
    @Body() data: PatchProjectReqDto
  ): Promise<void> {
    return this.projectService.update(projectId, userId, data)
  }

  @Delete(':projectId')
  @HttpCode(204)
  @ApiOperation({ summary: '프로젝트 삭제 (호스트 전용)' })
  @ApiResponse({ status: 204 })
  @ApiNotFoundResponse({ description: 'not_found_project_info' })
  @ApiResponse({ status: 403, description: 'forbidden_not_host' })
  delete(@User('id', ParseIntPipe) userId: number, @Param('projectId', ParseIntPipe) projectId: number): Promise<void> {
    return this.projectService.delete(projectId, userId)
  }
}
