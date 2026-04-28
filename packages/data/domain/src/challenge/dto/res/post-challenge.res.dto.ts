import { ApiProperty } from '@nestjs/swagger'
import { IsArray, IsDateString, IsEnum, IsInt, IsString, MaxLength } from 'class-validator'
import { ChallengeJoinType, ChallengeStatus, ChallengeVerificationFrequency } from '../../challenge.entity'

export class PostChallengeResDto {
  @IsInt()
  @ApiProperty({ type: 'integer', example: 1 })
  id: number

  @IsString()
  @ApiProperty({ example: '매일 알고리즘 1문제' })
  title: string

  @IsString()
  @ApiProperty({ example: '매일 1문제 풀이 인증하는 챌린지입니다.' })
  description: string

  @IsArray()
  @IsString({ each: true })
  @MaxLength(6, { each: true })
  @ApiProperty({ type: [String], example: ['알고리즘', '코테'] })
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
  @ApiProperty({ enum: ChallengeVerificationFrequency, example: ChallengeVerificationFrequency.ONCE_A_DAY })
  verificationFrequency: ChallengeVerificationFrequency

  @IsInt()
  @ApiProperty({ type: 'integer', example: 20 })
  maxParticipants: number

  @IsEnum(ChallengeJoinType)
  @ApiProperty({ enum: ChallengeJoinType, example: ChallengeJoinType.INSTANT })
  joinType: ChallengeJoinType

  @IsEnum(ChallengeStatus)
  @ApiProperty({ enum: ChallengeStatus, example: ChallengeStatus.RECRUITING })
  status: ChallengeStatus

  @IsInt()
  @ApiProperty({ type: 'integer', example: 12 })
  hostId: number

  @IsDateString()
  @ApiProperty({ example: '2026-03-24T13:00:00.000Z' })
  createdAt: string
}
