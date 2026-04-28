import { ApiProperty } from '@nestjs/swagger'
import { IsString } from 'class-validator'

export class PatchChallengeCommentReqDto {
  @IsString()
  @ApiProperty({ description: '댓글 내용', example: '수정된 댓글입니다.' })
  content: string
}
