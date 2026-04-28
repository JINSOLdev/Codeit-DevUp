import { ApiProperty } from '@nestjs/swagger'
import { IsDate, IsNumber, IsString } from 'class-validator'

export class PostAuthRegisterResDto {
  @IsNumber()
  @ApiProperty()
  id: number

  @IsString()
  @ApiProperty()
  email: string

  @IsString()
  @ApiProperty()
  nickname: string

  @IsDate()
  @ApiProperty()
  createdAt: Date
}
