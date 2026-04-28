import { PickType } from '@nestjs/swagger'
import { ProjectApplication } from '../../project-application.entity'

export class PostProjectApplicationReqDto extends PickType(ProjectApplication, ['position', 'motivation'] as const) {}
