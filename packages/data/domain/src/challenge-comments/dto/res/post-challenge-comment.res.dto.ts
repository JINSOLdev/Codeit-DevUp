import { ApiProperty } from '@nestjs/swagger'
import { IsDateString, IsInt, IsString, ValidateNested } from 'class-validator'
import { Type } from 'class-transformer'

class PostChallengeCommentResDtoAuthor {
  @IsInt()
  @ApiProperty({ type: 'integer' })
  id: number

  @IsString()
  @ApiProperty({ example: '콩순이' })
  nickname: string

  @IsString()
  @ApiProperty({ description: '작성자 프로필 이미지 URL' })
  profileImageUrl: string
}

class PostChallengeCommentResDtoData {
  @IsInt()
  @ApiProperty({ type: 'integer' })
  id: number

  @IsInt()
  @ApiProperty({ type: 'integer' })
  challengeId: number

  @ValidateNested()
  @Type(() => PostChallengeCommentResDtoAuthor)
  @ApiProperty({ type: PostChallengeCommentResDtoAuthor })
  author: PostChallengeCommentResDtoAuthor

  @IsString()
  @ApiProperty({ example: '저도 참여하고 싶어요!' })
  content: string

  @IsDateString()
  @ApiProperty({ example: '2026-03-24T13:00:00Z' })
  createdAt: string
}

export class PostChallengeCommentResDto {
  @IsString()
  @ApiProperty({ example: '댓글이 작성되었습니다.' })
  message: string

  @ValidateNested()
  @Type(() => PostChallengeCommentResDtoData)
  @ApiProperty({ type: PostChallengeCommentResDtoData })
  data: PostChallengeCommentResDtoData
}
