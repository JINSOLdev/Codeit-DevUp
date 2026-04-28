import { GetListOrderDto, GetListOrderDtoProperty, GetPaginationReqDto } from '@data/dto'
import { ApiProperty } from '@nestjs/swagger'
import { IsEnum, IsOptional } from 'class-validator'

enum GetCommentsReqDtoSort {
  createdAt = 'createdAt'
}

export class GetCommentsReqDto extends GetPaginationReqDto {
  @IsOptional()
  @IsEnum(GetCommentsReqDtoSort)
  @ApiProperty({ required: false, enum: GetCommentsReqDtoSort, description: '정렬 기준' })
  sort?: GetCommentsReqDtoSort

  @IsOptional()
  @GetListOrderDtoProperty()
  order?: GetListOrderDto
}
