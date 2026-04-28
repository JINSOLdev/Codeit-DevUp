import { ApiProperty } from '@nestjs/swagger'
import { PostChallengeResDto } from './post-challenge.res.dto'
import { IsString } from 'class-validator'
import { ValidateNested } from 'class-validator'
import { Type } from 'class-transformer'

export class PostChallengeCreateResponseDto {
  @IsString()
  @ApiProperty({ example: '챌린지가 생성되었습니다.' })
  message: string

  @ValidateNested()
  @Type(() => PostChallengeResDto)
  @ApiProperty({ type: PostChallengeResDto })
  data: PostChallengeResDto
}
