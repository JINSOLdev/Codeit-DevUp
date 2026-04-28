import { GetListOrderDto, GetListOrderDtoProperty, GetPaginationReqDto } from '@data/dto'
import { ApiProperty } from '@nestjs/swagger'
import { IsEnum, IsOptional } from 'class-validator'

enum GetApplicationsReqDtoSort {
  createdAt = 'createdAt'
}

export class GetApplicationsReqDto extends GetPaginationReqDto {
  @IsOptional()
  @IsEnum(GetApplicationsReqDtoSort)
  @ApiProperty({ required: false, enum: GetApplicationsReqDtoSort, description: '정렬 기준' })
  sort?: GetApplicationsReqDtoSort

  @IsOptional()
  @GetListOrderDtoProperty()
  order?: GetListOrderDto
}