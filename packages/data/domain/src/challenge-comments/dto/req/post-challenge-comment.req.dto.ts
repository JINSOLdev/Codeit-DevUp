import { ApiProperty } from '@nestjs/swagger'
import { Transform } from 'class-transformer'
import { IsString } from 'class-validator'

export class PostChallengeCommentReqDto {
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @ApiProperty({ example: '저도 참여하고 싶어요!' })
  content: string
}
