import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { ProjectApplication } from './project-application.entity'
import { ProjectApplicationService } from './project-application.service'
import { ProjectModule } from '../project/project.module'
import { ProjectEventModule } from '../event-emitter/project-event/project-event.module'
import { ProjectMember } from '../project-member/project-member.entity'
import { User } from '../user/entities/user.entity'

@Module({
  imports: [TypeOrmModule.forFeature([ProjectApplication, ProjectMember, User]), ProjectModule, ProjectEventModule],
  providers: [ProjectApplicationService],
  exports: [TypeOrmModule, ProjectApplicationService]
})
export class ProjectApplicationModule {}
