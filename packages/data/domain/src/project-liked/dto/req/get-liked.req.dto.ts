import { GetListOrderDto, GetListOrderDtoProperty, GetPaginationReqDto } from '@data/dto'
import { ApiProperty } from '@nestjs/swagger'
import { IsEnum, IsOptional } from 'class-validator'

enum GetLikedReqDtoSort {
  createdAt = 'createdAt'
}

export class GetLikedReqDto extends GetPaginationReqDto {
  @IsOptional()
  @IsEnum(GetLikedReqDtoSort)
  @ApiProperty({ required: false, enum: GetLikedReqDtoSort, description: '정렬 기준' })
  sort?: GetLikedReqDtoSort

  @IsOptional()
  @GetListOrderDtoProperty()
  order?: GetListOrderDto
}
