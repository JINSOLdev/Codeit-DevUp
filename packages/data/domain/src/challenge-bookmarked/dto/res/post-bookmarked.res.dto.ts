import { ApiProperty, PickType } from '@nestjs/swagger'
import { IsString } from 'class-validator'
import { ChallengeBookmarked } from '../../challenge-bookmarked.entity'

export class PostBookmarkedResDto extends PickType(ChallengeBookmarked, ['id', 'challengeId'] as const) {
  @IsString()
  @ApiProperty({ description: '처리 결과 메시지' })
  message: string
}
