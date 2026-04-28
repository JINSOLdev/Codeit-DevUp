import { ApiProperty } from '@nestjs/swagger'
import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator'
import { ChallengeVerificationStatus } from '../../challenge-verification.entity'

export class UpdateVerificationStatusReqDto {
  @ApiProperty({ 
    enum: ChallengeVerificationStatus, 
    example: ChallengeVerificationStatus.APPROVED,
    description: '인증 상태 (APPROVED 또는 REJECTED)'
  })
  @IsEnum(ChallengeVerificationStatus)
  status: ChallengeVerificationStatus

  @ApiProperty({ 
    example: '인증 이미지가 확인되지 않았습니다.',
    required: false,
    description: '거절 사유 (status가 REJECTED일 경우에만 필요)'
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  message?: string
}
