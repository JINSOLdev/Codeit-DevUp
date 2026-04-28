import { ApiProperty, PickType } from '@nestjs/swagger'
import { IsArray, IsInt, ValidateNested } from 'class-validator'
import { Type } from 'class-transformer'
import { ChallengeBookmarked } from '../../challenge-bookmarked.entity'

export class GetBookmarkedResDtoItem extends PickType(ChallengeBookmarked, ['id', 'challengeId', 'createdAt'] as const) {}

export class GetBookmarkedResDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => GetBookmarkedResDtoItem)
  @ApiProperty({ type: [GetBookmarkedResDtoItem] })
  data: GetBookmarkedResDtoItem[]

  @IsInt()
  @ApiProperty({ type: 'integer' })
  total: number
}
