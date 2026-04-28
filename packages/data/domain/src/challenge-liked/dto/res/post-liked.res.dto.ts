import { ApiProperty, PickType } from '@nestjs/swagger'
import { IsString } from 'class-validator'
import { ChallengeLiked } from '../../challenge-liked.entity'

export class PostLikedResDto extends PickType(ChallengeLiked, ['id', 'challengeId'] as const) {
  @IsString()
  @ApiProperty({ description: '처리 결과 메시지' })
  message: string
}
