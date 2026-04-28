import { Auth, User } from '@data/decorators'
import { ProjectApplicationService } from '@data/domain/project-applications'
import { PatchProjectApplicationRejectReqDto } from '@data/domain/project-applications/dto/req/patch-application-reject.req.dto'
import { PostProjectApplicationReqDto } from '@data/domain/project-applications/dto/req/post-application.req.dto'
import { GetProjectApplicationsResDto } from '@data/domain/project-applications/dto/res/get-applications.res.dto'
import { GetApplicationsReqDto } from '@data/domain/project-applications/dto/req/get-applications.req.dto'
import { IdParamsDto } from '@data/dto'
import { Body, Controller, Get, HttpCode, Param, ParseIntPipe, Patch, Post, Query } from '@nestjs/common'
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiResponse,
  ApiTags
} from '@nestjs/swagger'

@Auth({ type: 'user' })
@ApiTags('프로젝트 참여 관리')
@Controller()
export class ProjectApplicationsController {
  constructor(private readonly projectApplicationService: ProjectApplicationService) {}

  @Post('projects/:projectId/applications')
  @ApiOperation({ summary: '프로젝트 신청' })
  @ApiResponse({ status: 201, type: IdParamsDto })
  @ApiNotFoundResponse({ description: 'not_found_project_info | not_found_user_info' })
  @ApiForbiddenResponse({ description: 'host_cannot_apply' })
  @ApiBadRequestResponse({ description: 'recruitment_closed | project_in_progress | project_completed' })
  @ApiConflictResponse({ description: 'already_applied | duplicate' })
  apply(
    @User('id', ParseIntPipe) userId: number,
    @Param('projectId', ParseIntPipe) projectId: number,
    @Body() data: PostProjectApplicationReqDto
  ): Promise<IdParamsDto> {
    return this.projectApplicationService.apply(projectId, userId, data)
  }

  @Get('projects/:projectId/applications')
  @ApiOperation({ summary: '신청 목록 조회 (호스트 전용)' })
  @ApiResponse({ status: 200, type: GetProjectApplicationsResDto })
  @ApiNotFoundResponse({ description: 'not_found_project_info' })
  @ApiForbiddenResponse({ description: 'forbidden_not_host' })
  findAll(
    @User('id', ParseIntPipe) userId: number,
    @Param('projectId', ParseIntPipe) projectId: number,
    @Query() params: GetApplicationsReqDto
  ): Promise<GetProjectApplicationsResDto> {
    return this.projectApplicationService.findAllByProject(projectId, userId, params)
  }

  @Patch('applications/:applicationId/approve')
  @HttpCode(204)
  @ApiOperation({ summary: '신청 승인' })
  @ApiResponse({ status: 204 })
  @ApiNotFoundResponse({ description: 'not_found_application_info | not_found_project_info' })
  @ApiForbiddenResponse({ description: 'forbidden_not_host' })
  @ApiConflictResponse({ description: 'already_processed' })
  @ApiBadRequestResponse({ description: 'project_full' })
  approve(
    @User('id', ParseIntPipe) userId: number,
    @Param('applicationId', ParseIntPipe) applicationId: number
  ): Promise<void> {
    return this.projectApplicationService.approve(applicationId, userId)
  }

  @Patch('applications/:applicationId/reject')
  @HttpCode(204)
  @ApiOperation({ summary: '신청 거절' })
  @ApiResponse({ status: 204 })
  @ApiNotFoundResponse({ description: 'not_found_application_info | not_found_project_info' })
  @ApiForbiddenResponse({ description: 'forbidden_not_host' })
  @ApiConflictResponse({ description: 'already_processed' })
  reject(
    @User('id', ParseIntPipe) userId: number,
    @Param('applicationId', ParseIntPipe) applicationId: number,
    @Body() data: PatchProjectApplicationRejectReqDto
  ): Promise<void> {
    return this.projectApplicationService.reject(applicationId, userId, data)
  }
}
