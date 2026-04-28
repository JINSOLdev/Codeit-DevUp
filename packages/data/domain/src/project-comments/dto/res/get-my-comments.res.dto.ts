import { ApiProperty, PickType } from '@nestjs/swagger'
import { IsArray, IsInt, ValidateNested } from 'class-validator'
import { Type } from 'class-transformer'
import { ProjectComment } from '../../project-comment.entity'
import { Project } from '../../../project/project.entity'

export class MyCommentProjectDto extends PickType(Project, ['id', 'title'] as const) {}

export class GetMyCommentsResDtoItem extends PickType(ProjectComment, ['id', 'content', 'createdAt'] as const) {
  @ValidateNested()
  @Type(() => MyCommentProjectDto)
  @ApiProperty({ type: () => MyCommentProjectDto, description: '댓글이 속한 프로젝트 정보' })
  project: MyCommentProjectDto
}

export class GetMyCommentsResDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => GetMyCommentsResDtoItem)
  @ApiProperty({ type: () => [GetMyCommentsResDtoItem], description: '내가 작성한 댓글 목록' })
  data: GetMyCommentsResDtoItem[]

  @IsInt()
  @ApiProperty({ type: 'integer', description: '전체 개수' })
  total: number
}
