import { Module } from '@nestjs/common'
import { ProjectMemberModule } from '@data/domain/project-member'
import { ProjectMemberController } from './project-member.controller'

@Module({
  imports: [ProjectMemberModule],
  controllers: [ProjectMemberController]
})
export class ProjectMemberHttpModule {}
