import { ApiProperty } from '@nestjs/swagger'
import { IsArray, IsInt, ValidateNested } from 'class-validator'
import { Type } from 'class-transformer'
import { GetProjectResDto } from './get-project.res.dto'

export class GetProjectsResDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => GetProjectResDto)
  @ApiProperty({ type: () => [GetProjectResDto], description: '프로젝트 목록' })
  data: GetProjectResDto[]

  @IsInt()
  @ApiProperty({ type: 'integer', description: '전체 개수' })
  total: number
}
