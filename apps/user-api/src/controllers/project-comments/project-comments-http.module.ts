import { Module } from '@nestjs/common'
import { ProjectCommentModule } from '@data/domain/project-comments'
import { ProjectCommentsController } from './project-comments.controller'

@Module({
  imports: [ProjectCommentModule],
  controllers: [ProjectCommentsController]
})
export class ProjectCommentsHttpModule {}
