import { ApiProperty, PickType } from '@nestjs/swagger'
import { IsArray, IsBoolean, IsDate, IsEnum, IsInt, IsOptional, IsString, ValidateNested } from 'class-validator'
import { Type } from 'class-transformer'
import { ContactMethod, Position, ProjectStatus, ProjectType, TechStack } from '../../project.entity'
import { ApplicationStatus, ProjectApplication } from '../../../project-applications/project-application.entity'
import { UserSummaryDto } from '../../../user/dto/res/user-summary.res.dto'

class GetProjectUserApplicationDto extends PickType(ProjectApplication, [
  'id',
  'status',
  'rejectionType',
  'rejectionText'
] as const) {}

export class GetProjectResDto {
  @IsInt()
  @ApiProperty({ type: 'integer', description: '프로젝트 ID' })
  id: number

  @IsString()
  @ApiProperty({ description: '프로젝트 제목' })
  title: string

  @IsString()
  @ApiProperty({ description: '프로젝트 설명' })
  description: string

  @IsEnum(ProjectType)
  @ApiProperty({
    enum: ProjectType,
    enumName: 'ProjectType',
    description: 'portfolio: 포트폴리오 / contest: 공모전 / hackathon: 해커톤 / startup: 창업 / other: 기타'
  })
  projectType: ProjectType

  @IsArray()
  @IsEnum(TechStack, { each: true })
  @ApiProperty({ enum: TechStack, enumName: 'TechStack', isArray: true, description: '기술 스택 목록' })
  techStacks: TechStack[]

  @IsArray()
  @IsEnum(Position, { each: true })
  @ApiProperty({ enum: Position, enumName: 'Position', isArray: true, description: '모집 포지션 목록' })
  positions: Position[]

  @IsInt()
  @ApiProperty({ type: 'integer', description: '총 모집 인원' })
  maxMembers: number

  @IsInt()
  @ApiProperty({ type: 'integer', description: '현재 신청 인원' })
  currentMembers: number

  @IsString()
  @ApiProperty({ description: '모집 마감일 (YYYY-MM-DD)', example: '2026-03-20' })
  recruitEndDate: string

  @IsString()
  @ApiProperty({ description: '프로젝트 시작일 (YYYY-MM-DD)', example: '2026-03-21' })
  projectStartDate: string

  @IsString()
  @ApiProperty({ description: '프로젝트 종료일 (YYYY-MM-DD)', example: '2026-05-01' })
  projectEndDate: string

  @IsEnum(ContactMethod)
  @ApiProperty({
    enum: ContactMethod,
    enumName: 'ContactMethod',
    description: 'kakao_open_chat / email / google_form / discord'
  })
  contactMethod: ContactMethod

  @IsString()
  @ApiProperty({ description: '연락 링크 (오픈채팅방 URL, 이메일 주소, Google Form 링크 등)' })
  contactLink: string

  @IsEnum(ProjectStatus)
  @ApiProperty({
    enum: ProjectStatus,
    enumName: 'ProjectStatus',
    description: 'recruiting: 모집중 / recruitment_closed: 모집마감 / in_progress: 진행중 / completed: 완료'
  })
  status: ProjectStatus

  @IsInt()
  @ApiProperty({ type: 'integer', description: '조회수' })
  viewCount: number

  @IsDate()
  @ApiProperty({ example: '2026-04-13T12:34:56.789Z' })
  createdAt: Date

  @IsDate()
  @ApiProperty({ example: '2026-04-13T12:34:56.789Z' })
  updatedAt: Date

  @IsInt()
  @ApiProperty({ type: 'integer', description: '댓글 수' })
  commentCount: number

  @IsBoolean()
  @ApiProperty({ description: '좋아요 여부 (비로그인 시 false)' })
  liked: boolean

  @IsBoolean()
  @ApiProperty({ description: '지원 여부 (비로그인/미지원 시 false)' })
  hasApplication: boolean

  @IsOptional()
  @IsEnum(ApplicationStatus)
  @ApiProperty({
    enum: ApplicationStatus,
    enumName: 'ApplicationStatus',
    required: false,
    nullable: true,
    description: '지원 상태 (미지원/비로그인 시 null)'
  })
  applicationStatus?: ApplicationStatus | null

  @IsOptional()
  @ValidateNested()
  @Type(() => GetProjectUserApplicationDto)
  @ApiProperty({
    type: () => GetProjectUserApplicationDto,
    required: false,
    nullable: true,
    description: '내 지원 정보 (미지원/비로그인 시 null)'
  })
  application?: GetProjectUserApplicationDto | null

  @IsBoolean()
  @ApiProperty({ description: '내가 멤버인지 여부' })
  isMember: boolean

  @IsBoolean()
  @ApiProperty({ description: '내가 호스트인지 여부' })
  isHost: boolean

  @ValidateNested()
  @Type(() => UserSummaryDto)
  @ApiProperty({ type: () => UserSummaryDto, description: '호스트 정보' })
  host: UserSummaryDto
}
