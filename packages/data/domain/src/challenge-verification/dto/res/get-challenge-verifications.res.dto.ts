import { ApiProperty } from '@nestjs/swagger'
import { ChallengeVerificationStatus } from '../../challenge-verification.entity'

export class VerificationListUserData {
  @ApiProperty({ example: 13 })
  id: number

  @ApiProperty({ example: 'user123' })
  nickname: string

  @ApiProperty({ example: 'https://example.com/profile.jpg', required: false })
  profileImageUrl?: string
}

export class VerificationListItem {
  @ApiProperty({ example: 201 })
  verificationId: number

  @ApiProperty({ example: 1 })
  challengeId: number

  @ApiProperty()
  user: VerificationListUserData

  @ApiProperty({ example: '2026-04-09T12:00:00Z' })
  createdAt: string

  @ApiProperty({ example: '2026-04-09T12:00:00Z' })
  updatedAt: string

  @ApiProperty({ enum: ChallengeVerificationStatus, example: ChallengeVerificationStatus.PENDING })
  status: ChallengeVerificationStatus

  @ApiProperty({ example: '2026-04-09T12:00:00Z', required: false })
  reviewedAt?: string

  @ApiProperty({ example: 'rejected due to insufficient evidence', required: false })
  rejectionReason?: string
}

export class PaginationMeta {
  @ApiProperty({ example: 1 })
  page: number

  @ApiProperty({ example: 20 })
  limit: number

  @ApiProperty({ example: 100 })
  total: number

  @ApiProperty({ example: 5 })
  totalPages: number

  @ApiProperty({ example: true })
  hasNext: boolean

  @ApiProperty({ example: false })
  hasPrev: boolean
}

export class GetChallengeVerificationsResDto {
  @ApiProperty({ example: 'Challenge verifications retrieved successfully.' })
  message: string

  @ApiProperty({ type: [VerificationListItem] })
  data: VerificationListItem[]

  @ApiProperty()
  meta: PaginationMeta
}
