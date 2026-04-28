import { ApiProperty, PickType } from '@nestjs/swagger'
import { IsArray, IsEnum, IsInt, IsString, ValidateNested } from 'class-validator'
import { Type } from 'class-transformer'
import { CommentTargetType } from './get-my-comments.req.dto'
import { ProjectComment } from '../../project-comments/project-comment.entity'
import { UserSummaryDto } from '../../user/dto/res/user-summary.res.dto'

export class GetMyCommentsResDtoItem extends PickType(ProjectComment, [
  'id',
  'userId',
  'content',
  'createdAt'
] as const) {

  @IsEnum(CommentTargetType)
  @ApiProperty({ enum: CommentTargetType, enumName: 'CommentTargetType', description: '댓글 대상 타입' })
  type: CommentTargetType

  @IsInt()
  @ApiProperty({ type: 'integer', description: '프로젝트/챌린지 ID' })
  targetId: number

  @IsString()
  @ApiProperty({ description: '프로젝트/챌린지 제목' })
  title: string

  @ValidateNested()
  @Type(() => UserSummaryDto)
  @ApiProperty({ type: () => UserSummaryDto, description: '작성자 정보' })
  user: UserSummaryDto
}

export class GetMyCommentsResDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => GetMyCommentsResDtoItem)
  @ApiProperty({ type: [GetMyCommentsResDtoItem] })
  data: GetMyCommentsResDtoItem[]

  @IsInt()
  @ApiProperty({ type: 'integer', description: '전체 개수' })
  total: number
}
