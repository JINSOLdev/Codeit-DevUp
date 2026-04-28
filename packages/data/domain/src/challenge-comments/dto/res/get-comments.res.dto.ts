import { ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsArray, IsInt, IsString, ValidateNested } from 'class-validator'

export class GetCommentsResDtoAuthor {
  @IsInt()
  @ApiProperty({ type: 'integer' })
  id: number

  @IsString()
  @ApiProperty({ description: '작성자 닉네임' })
  nickname: string

  @IsString()
  @ApiProperty({ description: '작성자 프로필 이미지 URL' })
  profileImageUrl: string
}

export class GetCommentsResDtoItem {
  @IsInt()
  @ApiProperty({ type: 'integer' })
  id: number

  @ValidateNested()
  @Type(() => GetCommentsResDtoAuthor)
  @ApiProperty({ type: GetCommentsResDtoAuthor })
  author: GetCommentsResDtoAuthor

  @IsString()
  @ApiProperty({ description: '댓글 내용' })
  content: string

  @IsString()
  @ApiProperty({ description: '작성일시', example: '2026-03-24T13:00:00.000Z' })
  createdAt: string
}

export class GetCommentsResDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => GetCommentsResDtoItem)
  @ApiProperty({ type: [GetCommentsResDtoItem] })
  data: GetCommentsResDtoItem[]

  @IsInt()
  @ApiProperty({ type: 'integer', description: '전체 댓글 수' })
  total: number
}
