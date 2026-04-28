import { ApiProperty } from '@nestjs/swagger'
import { IsNumber, IsString, IsOptional, IsEnum } from 'class-validator'
import { ChallengeVerificationStatus } from '../../challenge-verification.entity'

export class MemberProgressData {
  @ApiProperty({ example: 13 })
  @IsNumber()
  userId: number

  @ApiProperty({ example: 'user123' })
  @IsString()
  nickname: string

  @ApiProperty({ example: 'https://example.com/profile.jpg', required: false })
  @IsOptional()
  @IsString()
  profileImageUrl?: string

  @ApiProperty({ example: 75.5 })
  @IsNumber()
  progressPercentage: number

  @ApiProperty({ example: 15 })
  @IsNumber()
  totalRequiredDays: number

  @ApiProperty({ example: 11 })
  @IsNumber()
  completedDays: number

  @ApiProperty({ example: 4 })
  @IsNumber()
  remainingDays: number

  @ApiProperty({ example: 'ON_TRACK' })
  @IsString()
  status: 'ON_TRACK' | 'BEHIND' | 'AHEAD' | 'COMPLETED'

  @ApiProperty({ enum: ChallengeVerificationStatus, example: ChallengeVerificationStatus.APPROVED, required: false })
  @IsOptional()
  @IsEnum(ChallengeVerificationStatus)
  todayVerificationStatus?: ChallengeVerificationStatus
}

export class GetMemberProgressResDto {
  @ApiProperty({ example: '멤버 진행 상황이 조회되었습니다.' })
  @IsString()
  message: string

  @ApiProperty()
  data: MemberProgressData
}
