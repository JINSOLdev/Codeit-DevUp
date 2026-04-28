import { Module } from '@nestjs/common'
import { NotificationModule } from '../../notification/notification.module'
import { ChallengeEventHandler } from './challenge-event.handler'
import { ChallengeEventPublisher } from './challenge-event.publisher'

@Module({
  imports: [NotificationModule],
  providers: [ChallengeEventHandler, ChallengeEventPublisher],
  exports: [ChallengeEventPublisher]
})
export class ChallengeEventModule {}