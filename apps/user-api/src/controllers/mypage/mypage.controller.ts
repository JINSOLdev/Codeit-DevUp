import { Auth, User } from '@data/decorators'
import { Controller, Get, ParseIntPipe, Query } from '@nestjs/common'
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { MyPageService } from '@data/domain/mypage/mypage.service'
import { GetMyPageResDto } from '@data/domain/mypage/dto/get-mypage.res.dto'
import { GetMyCommentsReqDto } from '@data/domain/mypage/dto/get-my-comments.req.dto'
import { GetMyCommentsResDto } from '@data/domain/mypage/dto/get-my-comments.res.dto'

@Auth({ type: 'user' })
@ApiTags('마이페이지')
@Controller('mypage')
export class MyPageController {
  constructor(private readonly myPageService: MyPageService) {}

  // @Get()
  // @ApiOperation({ summary: '마이페이지 조회' })
  // @ApiResponse({ status: 200, type: GetMyPageResDto })
  // async getMyPage(@User('id', ParseIntPipe) userId: number): Promise<GetMyPageResDto> {
  //   return await this.myPageService.getMyPage(userId)
  // }

  @Get('comments')
  @ApiOperation({ summary: '내가 작성한 모든 댓글 목록 조회' })
  @ApiResponse({ status: 200, type: GetMyCommentsResDto })
  getMyComments(
    @User('id', ParseIntPipe) userId: number,
    @Query() params: GetMyCommentsReqDto
  ): Promise<GetMyCommentsResDto> {
    return this.myPageService.getMyComments(userId, params)
  }
}
