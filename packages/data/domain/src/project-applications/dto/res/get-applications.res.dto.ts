import { ApiProperty, PickType } from '@nestjs/swagger'
import { IsArray, IsInt, ValidateNested } from 'class-validator'
import { Type } from 'class-transformer'
import { ProjectApplication } from '../../project-application.entity'
import { User } from '../../../user/entities/user.entity'

export class ApplicationApplicantDto extends PickType(User, ['id', 'nickname', 'profileImageUrl'] as const) {}

export class GetProjectApplicationsResDtoItem extends PickType(ProjectApplication, [
  'id',
  'userId',
  'position',
  'motivation',
  'status',
  'rejectionType',
  'rejectionText',
  'createdAt'
] as const) {
  @ValidateNested()
  @Type(() => ApplicationApplicantDto)
  @ApiProperty({ type: () => ApplicationApplicantDto, description: '신청자 정보' })
  user: ApplicationApplicantDto
}

export class GetProjectApplicationsResDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => GetProjectApplicationsResDtoItem)
  @ApiProperty({ type: () => [GetProjectApplicationsResDtoItem], description: '신청 목록' })
  data: GetProjectApplicationsResDtoItem[]

  @IsInt()
  @ApiProperty({ type: 'integer', description: '전체 개수' })
  total: number
}
