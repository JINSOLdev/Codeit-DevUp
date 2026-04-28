import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Project } from './project.entity'
import { ProjectService } from './project.service'
import { ProjectMember } from '../project-member/project-member.entity'
import { ProjectLiked } from '../project-liked/project-liked.entity'
import { ProjectApplication } from '../project-applications/project-application.entity'
import { User } from '../user/entities/user.entity'
import { ProjectEventModule } from '../event-emitter/project-event/project-event.module'

@Module({
  imports: [
    TypeOrmModule.forFeature([Project, ProjectMember, ProjectLiked, ProjectApplication, User]),
    ProjectEventModule
  ],
  providers: [ProjectService],
  exports: [TypeOrmModule, ProjectService]
})
export class ProjectModule {}
