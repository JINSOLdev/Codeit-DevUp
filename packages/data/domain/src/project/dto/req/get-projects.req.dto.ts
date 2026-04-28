import { GetListOrderDto, GetListOrderDtoProperty, GetPaginationReqDto } from '@data/dto'
import { ApiProperty } from '@nestjs/swagger'
import { Transform, Type } from 'class-transformer'
import { IsBoolean, IsEnum, IsInt, IsOptional, IsString, Min, isArray } from 'class-validator'
import { Position, ProjectStatus, ProjectType, TechStack } from '../../project.entity'

enum GetProjectsReqDtoSort {
  createdAt = 'createdAt',
  viewCount = 'viewCount',
  recruitEndDate = 'recruitEndDate'
}

export enum UserApplicationStatusFilter {
  pending = 'pending',
  approved = 'approved',
  rejected = 'rejected'
}

export class GetProjectsReqDto extends GetPaginationReqDto {
  @IsOptional()
  @IsString()
  @ApiProperty({ required: false, description: '키워드 검색 (title, techStacks, positions)' })
  search?: string

  @IsOptional()
  @IsEnum(ProjectStatus)
  @ApiProperty({ required: false, enum: ProjectStatus, enumName: 'ProjectStatus', description: '상태 필터' })
  status?: ProjectStatus

  @IsOptional()
  @IsEnum(ProjectType)
  @ApiProperty({
    required: false,
    enum: ProjectType,
    enumName: 'ProjectType',
    description: 'portfolio: 포트폴리오 / contest: 공모전 / hackathon: 해커톤 / startup: 창업 / other: 기타'
  })
  projectType?: ProjectType

  @IsOptional()
  @IsEnum(TechStack, { each: true })
  @Transform(({ value }) => (isArray(value) ? value : [value]))
  @ApiProperty({
    required: false,
    enum: TechStack,
    enumName: 'TechStack',
    isArray: true,
    description: '기술 스택 필터 (복수 선택)'
  })
  techStacks?: TechStack[]

  @IsOptional()
  @IsEnum(Position, { each: true })
  @Transform(({ value }) => (isArray(value) ? value : [value]))
  @ApiProperty({
    required: false,
    enum: Position,
    enumName: 'Position',
    isArray: true,
    description: '모집 포지션 필터 (복수 선택)'
  })
  positions?: Position[]

  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  @ApiProperty({ required: false, type: 'integer', description: '최소 인원' })
  minMembers?: number

  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  @ApiProperty({ required: false, type: 'integer', description: '최대 인원' })
  maxMembers?: number

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  @ApiProperty({ required: false, type: 'boolean', description: '내가 멤버인 프로젝트만 조회' })
  isMember?: boolean

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  @ApiProperty({ required: false, type: 'boolean', description: '내가 호스트인 프로젝트만 조회' })
  isHost?: boolean

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  @ApiProperty({ required: false, type: 'boolean', description: '내가 신청 중(pending)인 프로젝트만 조회' })
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
  @IsEnum(GetProjectsReqDtoSort)
  @ApiProperty({
    required: false,
    enum: GetProjectsReqDtoSort,
    description: 'createdAt: 최신순 / viewCount: 조회수 순 / recruitEndDate: 마감 임박순'
  })
  sort?: GetProjectsReqDtoSort

  @IsOptional()
  @GetListOrderDtoProperty()
  order?: GetListOrderDto
}
