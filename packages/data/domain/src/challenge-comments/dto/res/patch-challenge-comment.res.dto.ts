import { ApiProperty } from '@nestjs/swagger'
import { IsInt, IsString, ValidateNested } from 'class-validator'
import { Type } from 'class-transformer'

class PatchChallengeCommentResDtoData {
  @IsInt()
  @ApiProperty({ type: 'integer', example: 2 })
  id: number

  @IsInt()
  @ApiProperty({ type: 'integer', example: 1 })
  challengeId: number

  @IsString()
  @ApiProperty({ example: '저도 참여하고 싶어요. 잘 부탁드립니다!' })
  content: string

  @IsString()
  @ApiProperty({ example: '2026-03-24T14:20:00Z' })
  updatedAt: string
}

export class PatchChallengeCommentResDto {
  @IsString()
  @ApiProperty({ example: '댓글이 수정되었습니다.' })
  message: string

  @ValidateNested()
  @Type(() => PatchChallengeCommentResDtoData)
  @ApiProperty({ type: PatchChallengeCommentResDtoData })
  data: PatchChallengeCommentResDtoData
}