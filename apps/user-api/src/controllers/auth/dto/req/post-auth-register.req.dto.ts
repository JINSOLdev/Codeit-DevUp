import { regex } from '@data/lib'
import { JobLabel } from '@data/domain/user'
import { ApiProperty } from '@nestjs/swagger'
import { IsDefined, IsEmail, IsEnum, IsString, Matches } from 'class-validator'

export class PostAuthRegisterReqDto {
  @IsDefined()
  @IsEnum(JobLabel)
  @ApiProperty({ enum: JobLabel, required: true, description: '포지션' })
  position: JobLabel

  @IsDefined()
  @IsEmail()
  @ApiProperty({ required: true, description: '이메일' })
  email: string

  @IsDefined()
  @IsString()
  @ApiProperty({ required: true, description: '닉네임' })
  nickname: string

  @IsDefined()
  @Matches(regex.password.user)
  @ApiProperty({ pattern: regex.password.user.source, required: true })
  password: string
}
