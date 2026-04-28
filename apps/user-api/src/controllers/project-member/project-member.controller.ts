import { Auth, User } from '@data/decorators'
import { ProjectMemberService } from '@data/domain/project-member'
import { GetMembersResDto } from '@data/domain/project-member/dto/res/get-members.res.dto'
import { GetMembersReqDto } from '@data/domain/project-member/dto/req/get-members.req.dto'
import { Controller, Delete, Get, HttpCode, Param, ParseIntPipe, Query } from '@nestjs/common'
import { ApiForbiddenResponse, ApiNotFoundResponse, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'

@Auth({ type: 'user' })
@ApiTags('프로젝트 멤버')
@Controller('projects/:projectId/members')
export class ProjectMemberController {
  constructor(private readonly projectMemberService: ProjectMemberService) {}

  @Get()
  @ApiOperation({ summary: '프로젝트 멤버 목록 조회' })
  @ApiResponse({ status: 200, type: GetMembersResDto })
  @ApiNotFoundResponse({ description: 'not_found_project_info' })
  findAll(
    @Param('projectId', ParseIntPipe) projectId: number,
    @Query() params: GetMembersReqDto
  ): Promise<GetMembersResDto> {
    return this.projectMemberService.findAllByProject(projectId, params)
  }

  @Delete(':targetUserId')
  @HttpCode(204)
  @ApiOperation({ summary: '멤버 제거 (호스트 전용)' })
  @ApiResponse({ status: 204 })
  @ApiNotFoundResponse({ description: 'not_found_project_info | not_found_member_info' })
  @ApiForbiddenResponse({ description: 'forbidden_not_host' })
  remove(
    @User('id', ParseIntPipe) userId: number,
    @Param('projectId', ParseIntPipe) projectId: number,
    @Param('targetUserId', ParseIntPipe) targetUserId: number
  ): Promise<void> {
    return this.projectMemberService.removeMember(projectId, targetUserId, userId)
  }
}
