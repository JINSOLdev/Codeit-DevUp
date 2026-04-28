import { ApiProperty } from '@nestjs/swagger'
import { IsString } from 'class-validator'

export class DeleteChallengeCommentResDto {
  @IsString()
  @ApiProperty({ example: '댓글이 삭제되었습니다.' })
  message: string
}
