import { GetListOrderDto, GetListOrderDtoProperty, GetPaginationReqDto } from '@data/dto'
import { ApiProperty } from '@nestjs/swagger'
import { IsEnum, IsOptional } from 'class-validator'

enum GetBookmarkedReqDtoSort {
  createdAt = 'createdAt'
}

export class GetBookmarkedReqDto extends GetPaginationReqDto {
  @IsOptional()
  @IsEnum(GetBookmarkedReqDtoSort)
  @ApiProperty({ required: false, enum: GetBookmarkedReqDtoSort, description: '정렬 기준' })
  sort?: GetBookmarkedReqDtoSort

  @IsOptional()
  @GetListOrderDtoProperty()
  order?: GetListOrderDto
}
