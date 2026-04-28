import { PickType } from '@nestjs/swagger'
import { ProjectComment } from '../../project-comment.entity'

export class PatchProjectCommentReqDto extends PickType(ProjectComment, ['content'] as const) {}
