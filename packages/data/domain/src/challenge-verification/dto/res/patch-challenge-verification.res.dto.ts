import { ApiProperty } from '@nestjs/swagger'
import { IsArray, IsEnum, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator'
import { Type } from 'class-transformer'
import { ChallengeVerificationStatus } from '../../challenge-verification.entity'

export class PatchVerificationData {
  @ApiProperty({ example: 201 })
  @IsNumber()
  verificationId: number

  @ApiProperty({ example: 1 })
  @IsNumber()
  challengeId: number

  @ApiProperty({ example: '수정된 제목' })
  @IsString()
  title: string

  @ApiProperty({ example: '수정된 내용' })
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

  @ApiProperty({ example: '2026-04-11T12:00:00Z' })
  @IsString()
  updatedAt: string
}

export class PatchChallengeVerificationResDto {
  @ApiProperty({ example: '인증이 수정되었습니다.' })
  @IsString()
  message: string

  @ApiProperty()
  @ValidateNested()
  @Type(() => PatchVerificationData)
  data: PatchVerificationData
}
