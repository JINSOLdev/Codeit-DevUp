export enum ChallengeEventType {
  APPLICATION_SENT = 'CHALLENGE_APPLICATION_SENT',
  APPLICATION_RESPONDED = 'CHALLENGE_APPLICATION_RESPONDED',
  MEETING_CONFIRMED = 'CHALLENGE_MEETING_CONFIRMED',
  MEETING_CANCELED = 'CHALLENGE_MEETING_CANCELED',
  COMMENT_CREATED = 'CHALLENGE_COMMENT_CREATED'
}

export interface ApplicationSentMetadata {
  applicationId: number
  challengeId: number
  challengeTitle: string
  hostId: number
  applicantUserId: number
  applicantName: string
}

export interface ApplicationRespondedMetadata {
  applicationId: number
  challengeId: number
  challengeTitle: string
  hostUserId: number
  applicantUserId: number
  applicantName: string
  status: 'APPROVED' | 'REJECTED'
}

export interface MeetingConfirmedMetadata {
  challengeId: number
  challengeTitle: string
  recipientIds: number[]
}

export interface MeetingCanceledMetadata {
  challengeId: number
  challengeTitle: string
  recipientIds: number[]
}

export interface CommentCreatedMetadata {
  challengeId: number
  challengeTitle: string
  hostId: number
  commenterName: string
}

export type ChallengeEventMetadataMap = {
  [ChallengeEventType.APPLICATION_SENT]: ApplicationSentMetadata
  [ChallengeEventType.APPLICATION_RESPONDED]: ApplicationRespondedMetadata
  [ChallengeEventType.MEETING_CONFIRMED]: MeetingConfirmedMetadata
  [ChallengeEventType.MEETING_CANCELED]: MeetingCanceledMetadata
  [ChallengeEventType.COMMENT_CREATED]: CommentCreatedMetadata
}

export interface ChallengeBaseEvent<T extends ChallengeEventType> {
  type: T
  metadata: ChallengeEventMetadataMap[T]
}
