import { Module } from '@nestjs/common'
import { ProjectModule } from '@data/domain/project'
import { ProjectController } from './project.controller'

@Module({
  imports: [ProjectModule],
  controllers: [ProjectController]
})
export class ProjectHttpModule {}
