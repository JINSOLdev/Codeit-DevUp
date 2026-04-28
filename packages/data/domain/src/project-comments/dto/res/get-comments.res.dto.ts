import { ApiProperty, PickType } from '@nestjs/swagger'
import { IsArray, IsInt, ValidateNested } from 'class-validator'
import { Type } from 'class-transformer'
import { ProjectComment } from '../../project-comment.entity'
import { UserSummaryDto } from '../../../user/dto/res/user-summary.res.dto'

export class GetProjectCommentsResDtoItem extends PickType(ProjectComment, [
  'id',
  'userId',
  'content',
  'createdAt'
] as const) {
  @ValidateNested()
  @Type(() => UserSummaryDto)
  @ApiProperty({ type: () => UserSummaryDto, description: '작성자 정보' })
  user: UserSummaryDto
}

export class GetProjectCommentsResDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => GetProjectCommentsResDtoItem)
  @ApiProperty({ type: () => [GetProjectCommentsResDtoItem], description: '댓글 목록' })
  data: GetProjectCommentsResDtoItem[]

  @IsInt()
  @ApiProperty({ type: 'integer', description: '전체 개수' })
  total: number
}
