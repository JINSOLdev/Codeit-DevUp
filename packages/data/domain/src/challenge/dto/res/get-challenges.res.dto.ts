import { ApiProperty, PickType } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsArray, IsBoolean, IsEnum, IsInt, IsOptional, IsString, ValidateNested } from 'class-validator'
import {
  ChallengeJoinType,
  ChallengeStatus,
  ChallengeVerificationFrequency,
  ChallengeParticipationStatus
} from '../../challenge.entity'
import { ChallengeApplication } from '../../../challenge-applications/challenge-application.entity'

class GetChallengesResDtoHost {
  @IsInt()
  @ApiProperty({ type: 'integer' })
  id: number

  @IsString()
  @ApiProperty({ description: '호스트 닉네임' })
  nickname: string
}

class GetChallengeUserApplicationDto extends PickType(ChallengeApplication, [
  'id',
  'status',
  'reasonCategory',
  'reasonDetail'
] as const) {}

export class GetChallengesResDtoItem {
  @IsInt()
  @ApiProperty({ type: 'integer' })
  id: number

  @IsString()
  @ApiProperty()
  title: string

  @ValidateNested()
  @Type(() => GetChallengesResDtoHost)
  @ApiProperty({ type: GetChallengesResDtoHost })
  host: GetChallengesResDtoHost

  @IsEnum(ChallengeStatus)
  @ApiProperty({ enum: ChallengeStatus })
  status: ChallengeStatus

  @IsEnum(ChallengeJoinType)
  @ApiProperty({ enum: ChallengeJoinType, description: '참여 방식' })
  participationType: ChallengeJoinType

  @IsArray()
  @IsString({ each: true })
  @ApiProperty({ type: [String], description: '태그 목록' })
  tags: string[]

  @IsEnum(ChallengeVerificationFrequency)
  @ApiProperty({ enum: ChallengeVerificationFrequency, description: '인증 주기' })
  verificationFrequency: ChallengeVerificationFrequency

  @IsString()
  @ApiProperty({ description: '챌린지 시작일' })
  startDate: string

  @IsString()
  @ApiProperty({ description: '챌린지 종료일' })
  endDate: string

  @IsString()
  @ApiProperty({ description: '모집 마감일' })
  recruitDeadline: string

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
  @ApiProperty({ description: '참여 가능 여부' })
  isJoinable: boolean

  @IsString()
  @ApiProperty({ description: '참여 버튼 문구' })
  joinButtonLabel: string

  @IsBoolean()
  @ApiProperty({ description: '멤버 여부' })
  isMember: boolean

  @IsBoolean()
  @ApiProperty({ description: '호스트 여부' })
  isHost: boolean

  @IsBoolean()
  @ApiProperty({ description: '좋아요 여부' })
  isLiked: boolean

  @IsEnum(ChallengeParticipationStatus)
  @ApiProperty({
    enum: ChallengeParticipationStatus,
    description: '내 참여 상태'
  })
  myParticipationStatus: ChallengeParticipationStatus

  @IsOptional()
  @ValidateNested()
  @Type(() => GetChallengeUserApplicationDto)
  @ApiProperty({
    type: () => GetChallengeUserApplicationDto,
    required: false,
    nullable: true,
    description: '내 지원 정보 (미지원/비로그인 시 null)'
  })
  application?: GetChallengeUserApplicationDto | null
}

class PaginationDto {
  @IsInt()
  @ApiProperty({ type: 'integer' })
  page: number

  @IsInt()
  @ApiProperty({ type: 'integer' })
  limit: number

  @IsInt()
  @ApiProperty({ type: 'integer' })
  totalCount: number

  @IsInt()
  @ApiProperty({ type: 'integer' })
  totalPages: number

  @IsBoolean()
  @ApiProperty()
  hasNext: boolean
}

export class GetChallengesResDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => GetChallengesResDtoItem)
  @ApiProperty({ type: [GetChallengesResDtoItem] })
  data: GetChallengesResDtoItem[]

  @ValidateNested()
  @Type(() => PaginationDto)
  @ApiProperty({ type: PaginationDto })
  pagination: PaginationDto
}
