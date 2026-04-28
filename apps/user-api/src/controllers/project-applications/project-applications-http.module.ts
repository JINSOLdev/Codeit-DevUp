import { Module } from '@nestjs/common'
import { ProjectApplicationModule } from '@data/domain/project-applications'
import { ProjectApplicationsController } from './project-applications.controller'

@Module({
  imports: [ProjectApplicationModule],
  controllers: [ProjectApplicationsController]
})
export class ProjectApplicationsHttpModule {}
