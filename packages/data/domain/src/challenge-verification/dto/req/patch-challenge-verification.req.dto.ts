import { ApiProperty } from '@nestjs/swagger'
import { IsArray, IsOptional, IsString, Length, MaxLength } from 'class-validator'

export class PatchChallengeVerificationReqDto {
  @ApiProperty({ example: '수정된 제목', required: false })
  @IsOptional()
  @IsString()
  @Length(1, 100)
  title?: string

  @ApiProperty({ example: '수정된 내용', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  content?: string

  @ApiProperty({
    example: ['https://example.com/image1.jpg', 'https://example.com/image2.jpg'],
    required: false
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  imageUrls?: string[]
}
