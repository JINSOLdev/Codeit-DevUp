import { PickType } from '@nestjs/swagger'
import { ProjectApplication } from '../../project-application.entity'

export class PatchProjectApplicationRejectReqDto extends PickType(ProjectApplication, [
  'rejectionType',
  'rejectionText'
]) {}
