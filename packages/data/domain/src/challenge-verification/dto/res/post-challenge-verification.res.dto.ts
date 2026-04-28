import { ApiProperty } from '@nestjs/swagger'
import { IsArray, IsEnum, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator'
import { Type } from 'class-transformer'
import { ChallengeVerificationStatus } from '../../challenge-verification.entity'

export class VerificationUserData {
  @ApiProperty({ example: 13 })
  @IsNumber()
  id: number

  @ApiProperty({ example: '감자칩' })
  @IsString()
  nickname: string

  @ApiProperty({ example: 'https://example.com/profile.jpg', required: false })
  @IsOptional()
  @IsString()
  profileImageUrl?: string
}

export class VerificationData {
  @ApiProperty({ example: 201 })
  @IsNumber()
  verificationId: number

  @ApiProperty({ example: 1 })
  @IsNumber()
  challengeId: number

  @ApiProperty()
  @ValidateNested()
  @Type(() => VerificationUserData)
  user: VerificationUserData

  @ApiProperty({ example: "오늘 알고리즘 인증" })
  @IsString()
  title: string

  @ApiProperty({ example: '백트래킹 문제 2개 완료' })
  @IsString()
  content: string

  @ApiProperty({
    example: ['https://example.com/image1.jpg'],
    required: false
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  imageUrls: string[]

  @ApiProperty({ enum: ChallengeVerificationStatus, example: ChallengeVerificationStatus.PENDING })
  @IsEnum(ChallengeVerificationStatus)
  status: ChallengeVerificationStatus

  @ApiProperty({ example: '2026-04-09T12:00:00Z' })
  @IsString()
  createdAt: string
}

export class PostChallengeVerificationResDto {
  @ApiProperty({ example: '인증이 등록되었습니다.' })
  @IsString()
  message: string

  @ApiProperty()
  @ValidateNested()
  @Type(() => VerificationData)
  data: VerificationData
}
