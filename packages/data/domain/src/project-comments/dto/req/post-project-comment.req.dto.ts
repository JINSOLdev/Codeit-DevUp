import { PickType } from '@nestjs/swagger'
import { ProjectComment } from '../../project-comment.entity'

export class PostProjectCommentReqDto extends PickType(ProjectComment, ['content'] as const) {}
