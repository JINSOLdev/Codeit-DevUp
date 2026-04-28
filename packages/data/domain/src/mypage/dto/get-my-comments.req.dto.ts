import { GetPaginationReqDto } from '@data/dto'
import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsEnum, IsOptional } from 'class-validator'

export enum CommentTargetType {
  project = 'project',
  challenge = 'challenge'
}

export class GetMyCommentsReqDto extends GetPaginationReqDto {
  @IsOptional()
  @IsEnum(CommentTargetType)
  @ApiPropertyOptional({
    enum: CommentTargetType,
    enumName: 'CommentTargetType',
    description: '댓글 대상 타입 필터 (미입력 시 전체)'
  })
  type?: CommentTargetType
}
