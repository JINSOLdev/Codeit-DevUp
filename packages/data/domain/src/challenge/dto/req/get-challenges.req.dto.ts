import { ApiProperty } from '@nestjs/swagger'
import { Transform, Type } from 'class-transformer'
import { IsBoolean, IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator'
import { ChallengeJoinType, ChallengeStatus } from '../../challenge.entity'

export enum ChallengeSortType {
  latest = 'latest',
  popular = 'popular',
  deadline = 'deadline',
  oldest = 'oldest'
}

export enum UserApplicationStatusFilter {
  pending = 'pending',
  approved = 'approved',
  rejected = 'rejected'
}

export class GetChallengesReqDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @ApiProperty({
    required: false,
    type: 'integer',
    default: 1,
    description: '페이지 번호'
  })
  page?: number

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  @ApiProperty({
    required: false,
    type: 'integer',
    default: 8,
    description: '페이지당 개수'
  })
  limit?: number

  @IsOptional()
  @IsEnum(ChallengeStatus)
  @ApiProperty({
    required: false,
    enum: ChallengeStatus,
    description: '상태 필터'
  })
  status?: ChallengeStatus

  @IsOptional()
  @IsEnum(ChallengeJoinType)
  @ApiProperty({
    required: false,
    enum: ChallengeJoinType,
    description: '참여 방식 필터'
  })
  participationType?: ChallengeJoinType

  @IsOptional()
  @IsString()
  @ApiProperty({
    required: false,
    description: '태그 필터'
  })
  tag?: string

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  @ApiProperty({ required: false, type: 'boolean', description: '내가 멤버인 챌린지만 조회' })
  isMember?: boolean

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  @ApiProperty({ required: false, type: 'boolean', description: '내가 호스트인 챌린지만 조회' })
  isHost?: boolean

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  @ApiProperty({ required: false, type: 'boolean', description: '내가 신청 중(PENDING)인 챌린지만 조회' })
  hasPendingApplication?: boolean

  @IsOptional()
  @IsEnum(UserApplicationStatusFilter)
  @ApiProperty({
    required: false,
    enum: UserApplicationStatusFilter,
    enumName: 'UserApplicationStatusFilter'
  })
  applicationStatus?: UserApplicationStatusFilter

  @IsOptional()
  @IsEnum(ChallengeSortType)
  @ApiProperty({
    required: false,
    enum: ChallengeSortType,
    default: ChallengeSortType.latest,
    description: '정렬 기준'
  })
  sort?: ChallengeSortType
}
