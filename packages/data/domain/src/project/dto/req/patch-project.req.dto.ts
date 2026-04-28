import { PartialType } from '@nestjs/swagger'
import { PostProjectReqDto } from './post-project.req.dto'
import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsEnum, IsOptional } from 'class-validator'
import { ProjectStatus } from '../../project.types'

export class PatchProjectReqDto extends PartialType(PostProjectReqDto) {
  @IsOptional()
  @IsEnum(ProjectStatus)
  @ApiPropertyOptional({ enum: ProjectStatus, enumName: 'ProjectStatus' })
  status?: ProjectStatus
}
