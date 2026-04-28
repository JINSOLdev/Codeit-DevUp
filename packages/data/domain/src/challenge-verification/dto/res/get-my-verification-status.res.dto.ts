import { ApiProperty } from '@nestjs/swagger'
import { ChallengeVerificationFrequency } from '../../../challenge/challenge.types'

export class GetMyVerificationStatusResDto {
  @ApiProperty({ description: 'API 응답 메시지' })
  message: string

  @ApiProperty({ description: '챌린지 ID' })
  challengeId: number

  @ApiProperty({ description: '사용자 ID' })
  userId: number

  @ApiProperty({ description: '인증 빈도', enum: ChallengeVerificationFrequency })
  verificationFrequency: ChallengeVerificationFrequency

  @ApiProperty({ description: '현재 인증 상태', enum: ['BEFORE', 'PENDING', 'APPROVED', 'REJECTED'] })
  myVerificationStatus: 'BEFORE' | 'PENDING' | 'APPROVED' | 'REJECTED'

  @ApiProperty({ description: '현재 주기에서 인증 여부' })
  verifiedInCurrentCycle: boolean

  @ApiProperty({ description: '인증 생성 가능 여부' })
  canCreate: boolean

  @ApiProperty({ description: '인증 수정 가능 여부' })
  canEdit: boolean

  @ApiProperty({ description: '인증 삭제 가능 여부' })
  canDelete: boolean

  @ApiProperty({ description: '상태 메시지' })
  statusMessage: string
}
