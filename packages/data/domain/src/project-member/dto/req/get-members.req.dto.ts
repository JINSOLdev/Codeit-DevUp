import { GetListOrderDto, GetListOrderDtoProperty, GetPaginationReqDto } from '@data/dto'
import { ApiProperty } from '@nestjs/swagger'
import { IsEnum, IsOptional } from 'class-validator'

enum GetMembersReqDtoSort {
  createdAt = 'createdAt'
}

export class GetMembersReqDto extends GetPaginationReqDto {
  @IsOptional()
  @IsEnum(GetMembersReqDtoSort)
  @ApiProperty({ required: false, enum: GetMembersReqDtoSort, description: '정렬 기준' })
  sort?: GetMembersReqDtoSort

  @IsOptional()
  @GetListOrderDtoProperty()
  order?: GetListOrderDto
}
