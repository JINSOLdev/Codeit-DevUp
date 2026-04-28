import { User } from '@data/domain'
import { regex } from '@data/lib'
import { ApiProperty, PickType } from '@nestjs/swagger'
import { IsDefined, IsEmail, Matches } from 'class-validator'

export class PostAuthReqDto extends PickType(User, ['email']) {
  @IsDefined()
  @IsEmail()
  @ApiProperty({ required: true, description: '이메일' })
  email: string

  @IsDefined()
  @Matches(regex.password.user)
  @ApiProperty({ required: true, description: '비밀번호', pattern: regex.password.user.source })
  password: string
}
