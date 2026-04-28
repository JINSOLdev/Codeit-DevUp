import { ApiProperty } from '@nestjs/swagger'
import { ChallengeVerificationStatus } from '../../challenge-verification.entity'

export class VerificationDetailUserData {
  @ApiProperty({ example: 13 })
  id: number

  @ApiProperty({ example: 'user123' })
  nickname: string

  @ApiProperty({ example: 'https://example.com/profile.jpg', required: false })
  profileImageUrl?: string
}

export class VerificationReviewerData {
  @ApiProperty({ example: 5 })
  id: number

  @ApiProperty({ example: 'admin' })
  nickname: string

  @ApiProperty({ example: '2026-04-09T14:00:00Z' })
  reviewedAt: string
}

export class VerificationDetailData {
  @ApiProperty({ example: 201 })
  verificationId: number

  @ApiProperty({ example: 1 })
  challengeId: number

  @ApiProperty()
  user: VerificationDetailUserData

  @ApiProperty({ example: '2026-04-09T12:00:00Z' })
  createdAt: string

  @ApiProperty({ example: '2026-04-09T12:00:00Z' })
  updatedAt: string

  @ApiProperty({ enum: ChallengeVerificationStatus, example: ChallengeVerificationStatus.PENDING })
  status: ChallengeVerificationStatus

  @ApiProperty({ example: 'Algorithm practice challenge' })
  title: string

  @ApiProperty({ example: 'Solved 3 backtracking problems today' })
  content: string

  @ApiProperty({
    example: ['https://example.com/image1.jpg', 'https://example.com/image2.jpg'],
    required: false
  })
  imageUrls: string[]

  @ApiProperty({ required: false })
  reviewer?: VerificationReviewerData

  @ApiProperty({ example: 'Insufficient evidence provided', required: false })
  rejectionReason?: string
}

export class GetChallengeVerificationResDto {
  @ApiProperty({ example: 'Challenge verification retrieved successfully.' })
  message: string

  @ApiProperty()
  data: VerificationDetailData
}
