import { Module } from '@nestjs/common'
import { ProjectModule } from '@data/domain/project'
import { UpdateProjectCron } from './update-project.cron'

@Module({
  imports: [ProjectModule],
  providers: [UpdateProjectCron]
})
export class UpdateProjectModule {}
