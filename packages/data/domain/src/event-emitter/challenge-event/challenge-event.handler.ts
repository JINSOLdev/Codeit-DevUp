import { Injectable, Logger } from '@nestjs/common'
import { OnEvent } from '@nestjs/event-emitter'
import { NotificationService } from '../../notification/notification.service'
import { NotificationType, RecipientType } from '../../notification/types/notification.types'
import type {
  ApplicationRespondedMetadata,
  ApplicationSentMetadata,
  ChallengeBaseEvent,
  CommentCreatedMetadata,
  MeetingCanceledMetadata,
  MeetingConfirmedMetadata
} from './types/event.types'
import { ChallengeEventType } from './types/event.types'

@Injectable()
export class ChallengeEventHandler {
  private readonly logger = new Logger(ChallengeEventHandler.name)
  constructor(private readonly notificationService: NotificationService) {}

  @OnEvent(ChallengeEventType.APPLICATION_SENT)
  async handleApplicationSent(event: ChallengeBaseEvent<ChallengeEventType.APPLICATION_SENT>) {
    const { applicationId, challengeId, challengeTitle, hostId, applicantUserId, applicantName } =
      event.metadata as ApplicationSentMetadata

    try {
      await this.notificationService.create({
        type: NotificationType.challengeApplicationReceived,
        recipientId: hostId,
        recipientType: RecipientType.user,
        targetId: applicationId,
        data: { userName: applicantName, challengeId, challengeTitle }
      })
    } catch (error) {
      this.logger.error(
        `Failed to handle challenge application sent - applicantUserId: ${applicantUserId}`,
        error.stack
      )
    }
  }

  @OnEvent(ChallengeEventType.APPLICATION_RESPONDED)
  async handleApplicationResponded(event: ChallengeBaseEvent<ChallengeEventType.APPLICATION_RESPONDED>) {
    const { applicationId, challengeId, challengeTitle, hostUserId, applicantUserId, applicantName, status } =
      event.metadata as ApplicationRespondedMetadata

    const notificationType =
      status === 'APPROVED'
        ? NotificationType.challengeApplicationApproved
        : NotificationType.challengeApplicationRejected
    try {
      await this.notificationService.create({
        type: notificationType,
        recipientId: applicantUserId,
        recipientType: RecipientType.user,
        targetId: applicationId,
        data: { userName: applicantName, challengeId, challengeTitle }
      })
    } catch (error) {
      this.logger.error(`Failed to handle challenge application responded - hostUserId: ${hostUserId}`, error.stack)
    }
  }

  @OnEvent(ChallengeEventType.MEETING_CONFIRMED)
  async handleMeetingConfirmed(event: ChallengeBaseEvent<ChallengeEventType.MEETING_CONFIRMED>) {
    const { challengeId, challengeTitle, recipientIds } = event.metadata as MeetingConfirmedMetadata

    const results = await Promise.allSettled(
      recipientIds.map((recipientId) =>
        this.notificationService.create({
          type: NotificationType.challengeMeetingConfirmed,
          recipientId,
          recipientType: RecipientType.user,
          targetId: challengeId,
          data: { challengeTitle }
        })
      )
    )

    results.forEach((result, index) => {
      if (result.status === 'rejected') {
        this.logger.error(
          `Failed to send meeting confirmed notification - challengeId: ${challengeId}, recipientId: ${recipientIds[index]}`,
          result.reason?.stack
        )
      }
    })
  }

  @OnEvent(ChallengeEventType.MEETING_CANCELED)
  async handleMeetingCanceled(event: ChallengeBaseEvent<ChallengeEventType.MEETING_CANCELED>) {
    const { challengeId, challengeTitle, recipientIds } = event.metadata as MeetingCanceledMetadata

    const results = await Promise.allSettled(
      recipientIds.map((recipientId) =>
        this.notificationService.create({
          type: NotificationType.challengeMeetingCanceled,
          recipientId,
          recipientType: RecipientType.user,
          targetId: challengeId,
          data: { challengeTitle }
        })
      )
    )

    results.forEach((result, index) => {
      if (result.status === 'rejected') {
        this.logger.error(
          `Failed to send meeting canceled notification - challengeId: ${challengeId}, recipientId: ${recipientIds[index]}`,
          result.reason?.stack
        )
      }
    })
  }

  @OnEvent(ChallengeEventType.COMMENT_CREATED)
  async handleCommentCreated(event: ChallengeBaseEvent<ChallengeEventType.COMMENT_CREATED>) {
    const { challengeId, challengeTitle, hostId, commenterName } = event.metadata as CommentCreatedMetadata

    try {
      await this.notificationService.create({
        type: NotificationType.challengeNewComment,
        recipientId: hostId,
        recipientType: RecipientType.user,
        targetId: challengeId,
        data: { userName: commenterName, challengeTitle }
      })
    } catch (error) {
      this.logger.error(`Failed to handle challenge comment created - challengeId: ${challengeId}`, error.stack)
    }
  }
}
