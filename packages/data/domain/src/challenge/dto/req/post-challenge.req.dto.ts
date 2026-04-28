import { ApiProperty } from '@nestjs/swagger'
import {
  ArrayMaxSize,
  IsArray,
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min
} from 'class-validator'
import { ChallengeJoinType, ChallengeVerificationFrequency, ChallengeVerificationMethod } from '../../challenge.entity'

export class PostChallengeReqDto {
  @IsString()
  @MaxLength(100)
  @ApiProperty({ example: '매일 알고리즘 1문제' })
  title: string

  @IsString()
  @ApiProperty({ example: '매일 1문제 풀이 인증하는 챌린지입니다.' })
  description: string

  @IsArray()
  @ArrayMaxSize(3)
  @IsString({ each: true })
  @ApiProperty({
    type: [String],
    example: ['알고리즘', '코테']
  })
  tags: string[]

  @IsDateString()
  @ApiProperty({ example: '2026-03-15' })
  startDate: string

  @IsDateString()
  @ApiProperty({ example: '2026-03-31' })
  endDate: string

  @IsDateString()
  @ApiProperty({ example: '2026-03-14' })
  recruitDeadline: string

  @IsEnum(ChallengeVerificationFrequency)
  @ApiProperty({ enum: ChallengeVerificationFrequency })
  verificationFrequency: ChallengeVerificationFrequency

  @IsInt()
  @Min(1)
  @ApiProperty({ type: 'integer', example: 20, minimum: 1 })
  maxParticipants: number

  @IsEnum(ChallengeJoinType)
  @ApiProperty({ enum: ChallengeJoinType, example: ChallengeJoinType.INSTANT })
  joinType: ChallengeJoinType

  @IsOptional()
  @IsEnum(ChallengeVerificationMethod)
  @ApiProperty({
    enum: ChallengeVerificationMethod,
    description: '인증 방식 (추후 구현 예정)',
    required: false
  })
  verificationMethod?: ChallengeVerificationMethod
}
