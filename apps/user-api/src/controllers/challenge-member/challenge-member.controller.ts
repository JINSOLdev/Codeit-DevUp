import { Auth, User } from '@data/decorators'
import { ChallengeMemberService } from '@data/domain/challenge-member'
import { GetMembersResDto } from '@data/domain/challenge-member/dto/res/get-members.res.dto'
import { GetMembersReqDto } from '@data/domain/challenge-member/dto/req/get-members.req.dto'
import { Controller, Delete, Get, Param, ParseIntPipe, Query } from '@nestjs/common'
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'

@Auth({ type: 'user' })
@ApiTags('챌린지 멤버')
@Controller('challenges/:challengeId/members')
export class ChallengeMemberController {
  constructor(private readonly challengeMemberService: ChallengeMemberService) {}

  @Get()
  @ApiOperation({ summary: '챌린지 멤버 목록 조회' })
  @ApiResponse({ status: 200, type: GetMembersResDto })
  findAll(
    @Param('challengeId', ParseIntPipe) challengeId: number,
    @Query() params: GetMembersReqDto
  ): Promise<GetMembersResDto> {
    return this.challengeMemberService.findAllByChallenge(challengeId, params)
  }

  @Delete('/:targetUserId')
  @ApiOperation({ summary: '멤버 제거 (호스트 전용)' })
  remove(
    @User('id', ParseIntPipe) userId: number,
    @Param('challengeId', ParseIntPipe) challengeId: number,
    @Param('targetUserId', ParseIntPipe) targetUserId: number
  ) {
    return this.challengeMemberService.removeMember(challengeId, targetUserId, userId)
  }
}
