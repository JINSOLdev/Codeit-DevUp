import { ApiProperty } from '@nestjs/swagger'
import { IsArray, IsEnum, IsOptional, IsString, IsUrl, MaxLength } from 'class-validator'
import { JobLabel, Skill } from '../../user.type'

export class PatchUserReqDto {
  @IsOptional()
  @IsString()
  @MaxLength(30)
  @ApiProperty({ required: false, maxLength: 30, description: '닉네임' })
  nickname?: string

  @IsOptional()
  @IsEnum(JobLabel)
  @ApiProperty({ required: false, enum: JobLabel, description: '직무 라벨' })
  jobLabel?: JobLabel

  @IsOptional()
  @IsString()
  @ApiProperty({ required: false, description: '소개' })
  bio?: string

  @IsOptional()
  @IsUrl()
  @ApiProperty({ required: false, description: '프로필 이미지 URL' })
  profileImageUrl?: string

  @IsOptional()
  @IsArray()
  @IsEnum(Skill, { each: true })
  @ApiProperty({ required: false, enum: Skill, isArray: true, description: '기술 스택' })
  skills?: Skill[]

  @IsOptional()
  @IsUrl()
  @ApiProperty({ required: false, description: 'GitHub 링크' })
  githubLink?: string

  @IsOptional()
  @IsUrl()
  @ApiProperty({ required: false, description: '블로그 링크' })
  blogLink?: string

  @IsOptional()
  @IsUrl()
  @ApiProperty({ required: false, description: '포트폴리오 링크' })
  portfolioLink?: string
}
