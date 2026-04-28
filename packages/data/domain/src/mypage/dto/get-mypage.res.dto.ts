import { ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsArray, IsEnum, IsInt, IsOptional, IsString, IsUrl, ValidateNested } from 'class-validator'
import { ProjectStatus } from '../../project'

class MyPageProfileDto {
  @IsInt()
  @ApiProperty({ type: 'integer' })
  id: number

  @IsString()
  @ApiProperty()
  email: string

  @IsString()
  @ApiProperty()
  nickname: string

  @IsOptional()
  @IsString()
  @ApiProperty({ required: false, nullable: true })
  jobLabel?: string | null

  @IsOptional()
  @IsString()
  @ApiProperty({ required: false, nullable: true })
  bio?: string | null

  @IsOptional()
  @IsUrl()
  @ApiProperty({ required: false, nullable: true })
  profileImageUrl?: string | null

  @IsArray()
  @IsString({ each: true })
  @ApiProperty({ type: [String] })
  skills: string[]
}

class MyPageStatsDto {
  @IsInt()
  @ApiProperty({ type: 'integer' })
  challengeCount: number

  @IsInt()
  @ApiProperty({ type: 'integer' })
  projectCount: number

  @IsInt()
  @ApiProperty({ type: 'integer' })
  demoDayCount: number

  @IsInt()
  @ApiProperty({ type: 'integer' })
  totalVerificationCount: number
}

class OngoingChallengeDto {
  @IsInt()
  @ApiProperty({ type: 'integer' })
  challengeId: number

  @IsString()
  @ApiProperty()
  title: string

  @IsString()
  @ApiProperty({ example: '2026-04-15' })
  endDate: string

  @IsInt()
  @ApiProperty({ type: 'integer', example: 75 })
  progressRate: number
}

class OngoingProjectDto {
  @IsInt()
  @ApiProperty({ type: 'integer' })
  projectId: number

  @IsString()
  @ApiProperty()
  title: string

  @IsString()
  @ApiProperty()
  roleLabel: string

  @IsEnum(ProjectStatus)
  @ApiProperty({ example: 'recruiting' })
  status: ProjectStatus

  @IsInt()
  @ApiProperty({ type: 'integer' })
  memberCount: number

  @IsInt()
  @ApiProperty({ type: 'integer' })
  maxMembers: number
}

class MyPageOverviewDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OngoingChallengeDto)
  @ApiProperty({ type: [OngoingChallengeDto] })
  ongoingChallenges: OngoingChallengeDto[]

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OngoingProjectDto)
  @ApiProperty({ type: [OngoingProjectDto] })
  ongoingProjects: OngoingProjectDto[]
}

class MyPageDataDto {
  @ValidateNested()
  @Type(() => MyPageProfileDto)
  @ApiProperty({ type: MyPageProfileDto })
  profile: MyPageProfileDto

  @ValidateNested()
  @Type(() => MyPageStatsDto)
  @ApiProperty({ type: MyPageStatsDto })
  stats: MyPageStatsDto

  @ValidateNested()
  @Type(() => MyPageOverviewDto)
  @ApiProperty({ type: MyPageOverviewDto })
  overview: MyPageOverviewDto
}

export class GetMyPageResDto {
  @ValidateNested()
  @Type(() => MyPageDataDto)
  @ApiProperty({ type: MyPageDataDto })
  data: MyPageDataDto
}
