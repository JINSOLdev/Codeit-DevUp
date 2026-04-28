import { ApiProperty, PickType } from '@nestjs/swagger'
import { IsArray, IsInt, ValidateNested } from 'class-validator'
import { Type } from 'class-transformer'
import { ProjectLiked } from '../../project-liked.entity'
import { Project } from '../../../project/project.entity'

export class LikedProjectDto extends PickType(Project, [
  'id',
  'title',
  'projectType',
  'status',
  'positions',
  'techStacks',
  'recruitEndDate',
  'maxMembers'
] as const) {}

export class GetProjectLikedResDtoItem extends PickType(ProjectLiked, ['id', 'createdAt'] as const) {
  @ValidateNested()
  @Type(() => LikedProjectDto)
  @ApiProperty({ type: () => LikedProjectDto, description: '프로젝트 정보' })
  project: LikedProjectDto
}

export class GetProjectLikedResDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => GetProjectLikedResDtoItem)
  @ApiProperty({ type: () => [GetProjectLikedResDtoItem], description: '찜한 프로젝트 목록' })
  data: GetProjectLikedResDtoItem[]

  @IsInt()
  @ApiProperty({ type: 'integer', description: '전체 개수' })
  total: number
}
