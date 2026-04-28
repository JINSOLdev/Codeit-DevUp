import { ApiProperty } from '@nestjs/swagger'
import { IsArray, IsOptional, IsString, Length, MaxLength } from 'class-validator'

export class PostChallengeVerificationReqDto {
  @ApiProperty({ example: '오늘 알고리즘 인증' })
  @IsString()
  @Length(1, 100)
  title: string

  @ApiProperty({ example: '백트래킹 문제 2개 완료' })
  @IsString()
  @MaxLength(1000)
  content: string

  @ApiProperty({
    example: ['https://example.com/image1.jpg', 'https://example.com/image2.jpg'],
    required: false
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  imageUrls?: string[]
}
