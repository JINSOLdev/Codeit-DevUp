import { Module } from '@nestjs/common'
import { NotificationModule } from '../../notification/notification.module'
import { ProjectEventHandler } from './project-event.handler'
import { ProjectEventPublisher } from './project-event.publisher'

@Module({
  imports: [NotificationModule],
  providers: [ProjectEventHandler, ProjectEventPublisher],
  exports: [ProjectEventPublisher]
})
export class ProjectEventModule {}
