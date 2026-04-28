import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { ProjectComment } from './project-comment.entity'
import { ProjectCommentService } from './project-comment.service'
import { Project } from '../project/project.entity'
import { User } from '../user/entities/user.entity'
import { ProjectEventModule } from '../event-emitter/project-event/project-event.module'

@Module({
  imports: [TypeOrmModule.forFeature([ProjectComment, Project, User]), ProjectEventModule],
  providers: [ProjectCommentService],
  exports: [TypeOrmModule, ProjectCommentService]
})
export class ProjectCommentModule {}
