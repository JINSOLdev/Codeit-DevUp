import { ApiProperty } from '@nestjs/swagger'
import { IsNumber, IsString, ValidateNested } from 'class-validator'
import { Type } from 'class-transformer'

class AuthUserDto {
  @IsNumber()
  @ApiProperty()
  id: number

  @IsString()
  @ApiProperty()
  email: string

  @IsString()
  @ApiProperty()
  nickname: string
}

export class PostAuthResDto {
  @ValidateNested()
  @Type(() => AuthUserDto)
  @ApiProperty({ type: AuthUserDto })
  user: AuthUserDto

  @IsString()
  @ApiProperty()
  accessToken: string

  @IsNumber()
  @ApiProperty()
  expiresIn: number

  @IsString()
  @ApiProperty()
  refreshToken: string
}
