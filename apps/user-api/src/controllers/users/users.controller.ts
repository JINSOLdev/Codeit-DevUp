import { UserService } from '@data/domain/user'
import { GetUserResDto, PatchUserReqDto } from '@data/domain/user'
import { Auth, User } from '@data/decorators'
import { IdParamsDto } from '@data/dto'
import { Body, Controller, Get, ParseIntPipe, Patch } from '@nestjs/common'
import { ApiNotFoundResponse, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'

@Auth({ type: 'user' })
@ApiTags('회원 정보')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UserService) {}

  @Get('me')
  @ApiOperation({ summary: '내 정보 조회' })
  @ApiResponse({ status: 200, type: GetUserResDto })
  @ApiNotFoundResponse({ description: 'not_found_user_info' })
  get(@User('id', ParseIntPipe) userId: number): Promise<GetUserResDto> {
    return this.usersService.findOne(userId)
  }

  @Patch('me')
  @ApiOperation({ summary: '내 정보 수정' })
  @ApiResponse({ status: 200, type: IdParamsDto })
  @ApiNotFoundResponse({ description: 'not_found_user_info' })
  update(@User('id', ParseIntPipe) userId: number, @Body() data: PatchUserReqDto): Promise<IdParamsDto> {
    return this.usersService.update(userId, data)
  }
}
