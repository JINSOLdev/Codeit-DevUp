import { ApiProperty, PickType } from '@nestjs/swagger'
import { IsArray, IsInt, ValidateNested } from 'class-validator'
import { Type } from 'class-transformer'
import { ChallengeLiked } from '../../challenge-liked.entity'

export class GetLikedResDtoItem extends PickType(ChallengeLiked, ['id', 'challengeId', 'createdAt'] as const) {}

export class GetLikedResDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => GetLikedResDtoItem)
  @ApiProperty({ type: [GetLikedResDtoItem] })
  data: GetLikedResDtoItem[]

  @IsInt()
  @ApiProperty({ type: 'integer' })
  total: number
}
