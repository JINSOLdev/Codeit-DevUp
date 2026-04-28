import { ApiProperty } from '@nestjs/swagger'
import {
  ChallengeJoinType,
  ChallengeStatus,
  ChallengeVerificationFrequency,
  ChallengeVerificationMethod
} from '../../challenge.entity'
import { IsArray, IsDateString, IsEnum, IsInt, IsOptional, IsString, MaxLength, ValidateNested } from 'class-validator'
import { Type } from 'class-transformer'

class PatchChallengeDataDto {
  @IsInt()
  @ApiProperty()
  id: number

  @IsString()
  @ApiProperty()
  title: string

  @IsString()
  @ApiProperty()
  description: string

  @IsArray()
  @IsString({ each: true })
  @MaxLength(6, { each: true })
  @ApiProperty({ type: [String] })
  tags: string[]

  @IsDateString()
  @ApiProperty()
  startDate: string

  @IsDateString()
  @ApiProperty()
  endDate: string

  @IsDateString()
  @ApiProperty()
  recruitDeadline: string

  @IsEnum(ChallengeVerificationFrequency)
  @ApiProperty({ enum: ChallengeVerificationFrequency })
  verificationFrequency: ChallengeVerificationFrequency

  @IsOptional()
  @IsEnum(ChallengeVerificationMethod)
  @ApiProperty({
    enum: ChallengeVerificationMethod,
    description: '인증 방식 (추후 구현 예정)',
    required: false
  })
  verificationMethod?: ChallengeVerificationMethod

  @IsInt()
  @ApiProperty()
  maxParticipants: number

  @IsEnum(ChallengeJoinType)
  @ApiProperty({ enum: ChallengeJoinType })
  joinType: ChallengeJoinType

  @IsEnum(ChallengeStatus)
  @ApiProperty({ enum: ChallengeStatus })
  status: ChallengeStatus

  @IsInt()
  @ApiProperty()
  hostId: number

  @IsDateString()
  @ApiProperty()
  createdAt: string

  @IsDateString()
  @ApiProperty()
  updatedAt: string
}

export class PatchChallengeResDto {
  @IsString()
  @ApiProperty()
  message: string

  @ValidateNested()
  @Type(() => PatchChallengeDataDto)
  @ApiProperty({ type: PatchChallengeDataDto })
  data: PatchChallengeDataDto
}
