import { ApiProperty } from '@nestjs/swagger'
import { IsInt, IsString, IsEnum } from 'class-validator'
import { ChallengeVerificationStatus } from '../../challenge-verification.entity'

export class ReviewerInfo {
  @ApiProperty({ example: 12 })
  @IsInt()
  id: number

  @ApiProperty({ example: '공순이' })
  @IsString()
  nickname: string
}

export class UpdateVerificationStatusData {
  @ApiProperty({ example: 201 })
  @IsInt()
  verificationId: number

  @ApiProperty({ enum: ChallengeVerificationStatus, example: ChallengeVerificationStatus.APPROVED })
  @IsEnum(ChallengeVerificationStatus)
  status: ChallengeVerificationStatus

  @ApiProperty({ example: '2026-04-09T14:00:00Z' })
  @IsString()
  reviewedAt: string

  @ApiProperty({
    example: {
      id: 12,
      nickname: '공순이'
    }
  })
  reviewedBy: ReviewerInfo
}

export class UpdateVerificationStatusResDto {
  @ApiProperty({ example: '인증 상태가 변경되었습니다.' })
  @IsString()
  message: string

  @ApiProperty()
  data: UpdateVerificationStatusData
}
