import { PickType } from '@nestjs/swagger'
import { Project } from '../../project.entity'

export class PostProjectReqDto extends PickType(Project, [
  'title',
  'description',
  'projectType',
  'techStacks',
  'positions',
  'maxMembers',
  'recruitEndDate',
  'projectStartDate',
  'projectEndDate',
  'contactMethod',
  'contactLink'
]) {}
