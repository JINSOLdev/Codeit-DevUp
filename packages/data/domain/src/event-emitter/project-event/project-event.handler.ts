import { Injectable, Logger } from '@nestjs/common'
import { OnEvent } from '@nestjs/event-emitter'
import { NotificationService } from '../../notification/notification.service'
import { NotificationType, RecipientType } from '../../notification/types/notification.types'
import type {
  ApplicationRespondedMetadata,
  ApplicationSentMetadata,
  CommentCreatedMetadata,
  MeetingCanceledMetadata,
  MeetingConfirmedMetadata,
  ProjectBaseEvent
} from './types/event.types'
import { ProjectEventType } from './types/event.types'

@Injectable()
export class ProjectEventHandler {
  private readonly logger = new Logger(ProjectEventHandler.name)

  constructor(private readonly notificationService: NotificationService) {}

  @OnEvent(ProjectEventType.APPLICATION_SENT)
  async handleApplicationSent(event: ProjectBaseEvent<ProjectEventType.APPLICATION_SENT>) {
    const { applicationId, projectId, projectTitle, hostId, applicantUserId, applicantName } =
      event.metadata as ApplicationSentMetadata

    try {
      await this.notificationService.create({
        type: NotificationType.projectApplicationReceived,
        recipientId: hostId,
        recipientType: RecipientType.user,
        targetId: applicationId,
        data: { userName: applicantName, projectId, projectTitle }
      })
    } catch (error) {
      this.logger.error(`Failed to handle project application sent - applicantUserId: ${applicantUserId}`, error.stack)
    }
  }

  @OnEvent(ProjectEventType.APPLICATION_RESPONDED)
  async handleApplicationResponded(event: ProjectBaseEvent<ProjectEventType.APPLICATION_RESPONDED>) {
    const { applicationId, projectId, projectTitle, hostUserId, applicantUserId, applicantName, status } =
      event.metadata as ApplicationRespondedMetadata

    const notificationType =
      status === 'APPROVED' ? NotificationType.projectApplicationApproved : NotificationType.projectApplicationRejected

    try {
      await this.notificationService.create({
        type: notificationType,
        recipientId: applicantUserId,
        recipientType: RecipientType.user,
        targetId: applicationId,
        data: { userName: applicantName, projectId, projectTitle }
      })
    } catch (error) {
      this.logger.error(`Failed to handle project application responded - hostUserId: ${hostUserId}`, error.stack)
    }
  }

  @OnEvent(ProjectEventType.MEETING_CONFIRMED)
  async handleMeetingConfirmed(event: ProjectBaseEvent<ProjectEventType.MEETING_CONFIRMED>) {
    const { projectId, projectTitle, recipientIds } = event.metadata as MeetingConfirmedMetadata

    const results = await Promise.allSettled(
      recipientIds.map((recipientId) =>
        this.notificationService.create({
          type: NotificationType.projectMeetingConfirmed,
          recipientId,
          recipientType: RecipientType.user,
          targetId: projectId,
          data: { projectTitle }
        })
      )
    )

    results.forEach((result, index) => {
      if (result.status === 'rejected') {
        this.logger.error(
          `Failed to send meeting confirmed notification - projectId: ${projectId}, recipientId: ${recipientIds[index]}`,
          result.reason?.stack
        )
      }
    })
  }

  @OnEvent(ProjectEventType.MEETING_CANCELED)
  async handleMeetingCanceled(event: ProjectBaseEvent<ProjectEventType.MEETING_CANCELED>) {
    const { projectId, projectTitle, recipientIds } = event.metadata as MeetingCanceledMetadata

    const results = await Promise.allSettled(
      recipientIds.map((recipientId) =>
        this.notificationService.create({
          type: NotificationType.projectMeetingCanceled,
          recipientId,
          recipientType: RecipientType.user,
          targetId: projectId,
          data: { projectTitle }
        })
      )
    )

    results.forEach((result, index) => {
      if (result.status === 'rejected') {
        this.logger.error(
          `Failed to send meeting canceled notification - projectId: ${projectId}, recipientId: ${recipientIds[index]}`,
          result.reason?.stack
        )
      }
    })
  }

  @OnEvent(ProjectEventType.COMMENT_CREATED)
  async handleCommentCreated(event: ProjectBaseEvent<ProjectEventType.COMMENT_CREATED>) {
    const { projectId, projectTitle, hostId, commenterName } = event.metadata as CommentCreatedMetadata

    try {
      await this.notificationService.create({
        type: NotificationType.projectNewComment,
        recipientId: hostId,
        recipientType: RecipientType.user,
        targetId: projectId,
        data: { userName: commenterName, projectTitle }
      })
    } catch (error) {
      this.logger.error(`Failed to handle project comment created - projectId: ${projectId}`, error.stack)
    }
  }
}
