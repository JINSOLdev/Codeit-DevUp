import { Module } from '@nestjs/common'
import { UpdateProjectModule } from './update-project/update-project.module'
import { UpdateChallengeModule } from './update-challenge/update-challenge.module'
import { DeleteNotificationModule } from './delete-notification/delete-notification.module'

@Module({
  imports: [UpdateProjectModule, UpdateChallengeModule, DeleteNotificationModule],
  exports: [UpdateProjectModule, UpdateChallengeModule, DeleteNotificationModule]
})
export class CronModule {}
