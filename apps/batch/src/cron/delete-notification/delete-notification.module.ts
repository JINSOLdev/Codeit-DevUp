import { Module } from '@nestjs/common'
import { NotificationModule } from '@data/domain/notification'
import { DeleteNotificationCron } from './delete-notification.cron'

@Module({
  imports: [NotificationModule],
  providers: [DeleteNotificationCron]
})
export class DeleteNotificationModule {}
