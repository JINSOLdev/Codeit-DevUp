import { Injectable, Logger } from '@nestjs/common'
import { Cron } from '@nestjs/schedule'
import { NotificationService } from '@data/domain/notification'

@Injectable()
export class DeleteNotificationCron {
  private readonly logger = new Logger(DeleteNotificationCron.name)

  constructor(private notificationService: NotificationService) {}

  /**
   * 매일 새벽 3시(KST)에 실행
   * 생성된 지 30일이 경과한 알림을 삭제
   */
  @Cron('0 3 * * *', { timeZone: 'Asia/Seoul' })
  async deleteExpiredNotifications() {
    this.logger.log('Starting daily expired notification cleanup...')

    try {
      const deletedCount = await this.notificationService.deleteExpiredNotifications()
      this.logger.log(`Deleted ${deletedCount} expired notifications`)
    } catch (error) {
      this.logger.error('Failed to delete expired notifications', error.stack)
    }
  }
}
