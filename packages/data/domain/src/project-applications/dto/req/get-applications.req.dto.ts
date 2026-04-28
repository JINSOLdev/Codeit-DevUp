import { GetListOrderDto, GetListOrderDtoProperty, GetPaginationReqDto } from '@data/dto'
import { ApiProperty } from '@nestjs/swagger'
import { IsEnum, IsOptional } from 'class-validator'
import { ApplicationStatus } from '../../project-application.entity'

enum GetApplicationsReqDtoSort {
  createdAt = 'createdAt'
}

export class GetApplicationsReqDto extends GetPaginationReqDto {
  @IsOptional()
  @IsEnum(ApplicationStatus)
  @ApiProperty({
    required: false,
    enum: ApplicationStatus,
    description: 'pending: 대기 / approved: 승인 / rejected: 거절'
  })
  status?: ApplicationStatus

  @IsOptional()
  @IsEnum(GetApplicationsReqDtoSort)
  @ApiProperty({ required: false, enum: GetApplicationsReqDtoSort, description: '정렬 기준' })
  sort?: GetApplicationsReqDtoSort

  @IsOptional()
  @GetListOrderDtoProperty()
  order?: GetListOrderDto
}
