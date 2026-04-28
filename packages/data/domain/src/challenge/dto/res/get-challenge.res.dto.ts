import { ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsArray, IsBoolean, IsEnum, IsInt, IsOptional, IsString, ValidateNested } from 'class-validator'
import {
  ChallengeJoinType,
  ChallengeStatus,
  ChallengeVerificationFrequency,
  ChallengeVerificationMethod,
  ChallengeParticipationStatus
} from '../../challenge.entity'

class GetChallengeResDtoHost {
  @IsInt()
  @ApiProperty({ type: 'integer' })
  id: number

  @IsString()
  @ApiProperty({ description: '호스트 닉네임' })
  nickname: string

  @IsOptional()
  @IsString()
  @ApiProperty({ description: '호스트 프로필 이미지 URL', required: false })
  profileImageUrl?: string
}

class GetChallengeResDtoData {
  @IsInt()
  @ApiProperty({ type: 'integer' })
  id: number

  @IsString()
  @ApiProperty()
  title: string

  @IsString()
  @ApiProperty()
  description: string

  @IsArray()
  @IsString({ each: true })
  @ApiProperty({ type: [String], description: '태그 목록' })
  tags: string[]

  @IsEnum(ChallengeStatus)
  @ApiProperty({ enum: ChallengeStatus })
  status: ChallengeStatus

  @IsOptional()
  @IsEnum(ChallengeVerificationMethod)
  @ApiProperty({
    enum: ChallengeVerificationMethod,
    description: '인증 방식 (추후 구현 예정)',
    required: false
  })
  verificationMethod?: ChallengeVerificationMethod

  @IsEnum(ChallengeJoinType)
  @ApiProperty({ enum: ChallengeJoinType, description: '참여 방식' })
  joinType: ChallengeJoinType

  @IsString()
  @ApiProperty({ description: '모집 마감일' })
  recruitDeadline: string

  @IsString()
  @ApiProperty({ description: '챌린지 시작일' })
  startDate: string

  @IsString()
  @ApiProperty({ description: '챌린지 종료일' })
  endDate: string

  @IsEnum(ChallengeVerificationFrequency)
  @ApiProperty({ enum: ChallengeVerificationFrequency, description: '인증 주기' })
  verificationFrequency: ChallengeVerificationFrequency

  @IsInt()
  @ApiProperty({ type: 'integer', description: '현재 참여 인원' })
  participantCount: number

  @IsInt()
  @ApiProperty({ type: 'integer', description: '최대 참여 인원' })
  maxParticipants: number

  @IsInt()
  @ApiProperty({ type: 'integer', description: '진행률' })
  progressRate: number

  @IsInt()
  @ApiProperty({ type: 'integer', description: '조회수' })
  viewCount: number

  @IsInt()
  @ApiProperty({ type: 'integer', description: '댓글 수' })
  commentCount: number

  @IsBoolean()
  @ApiProperty({ description: '북마크 여부' })
  isBookmarked: boolean

  @IsBoolean()
  @ApiProperty({ description: '호스트 여부' })
  isHost: boolean

  @IsBoolean()
  @ApiProperty({ description: '멤버 여부' })
  isMember: boolean

  @IsBoolean()
  @ApiProperty({ description: '좋아요 여부' })
  isLiked: boolean

  @IsEnum(ChallengeParticipationStatus)
  @ApiProperty({
    enum: ChallengeParticipationStatus,
    description: '내 참여 상태'
  })
  myParticipationStatus: ChallengeParticipationStatus

  @IsBoolean()
  @ApiProperty({ description: '참여 가능 여부' })
  isJoinable: boolean

  @ValidateNested()
  @Type(() => GetChallengeResDtoHost)
  @ApiProperty({ type: GetChallengeResDtoHost })
  host: GetChallengeResDtoHost

  @IsInt()
  @ApiProperty({ type: 'integer', description: '검증된 멤버 수' })
  verifiedMemberCount: number

  @IsInt()
  @ApiProperty({ type: 'integer', description: '검증되지 않은 멤버 수' })
  unverifiedMemberCount: number

  @IsString()
  @ApiProperty({ description: '생성일시' })
  createdAt: string

  @IsString()
  @ApiProperty({ description: '수정일시' })
  updatedAt: string
}

export class GetChallengeResDto {
  @ValidateNested()
  @Type(() => GetChallengeResDtoData)
  @ApiProperty({ type: GetChallengeResDtoData })
  data: GetChallengeResDtoData
}
