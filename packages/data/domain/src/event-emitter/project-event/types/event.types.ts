export enum ProjectEventType {
  APPLICATION_SENT = 'PROJECT_APPLICATION_SENT',
  APPLICATION_RESPONDED = 'PROJECT_APPLICATION_RESPONDED',
  MEETING_CONFIRMED = 'PROJECT_MEETING_CONFIRMED',
  MEETING_CANCELED = 'PROJECT_MEETING_CANCELED',
  COMMENT_CREATED = 'PROJECT_COMMENT_CREATED'
}

export interface ApplicationSentMetadata {
  applicationId: number
  projectId: number
  projectTitle: string
  hostId: number
  applicantUserId: number
  applicantName: string
}

export interface ApplicationRespondedMetadata {
  applicationId: number
  projectId: number
  projectTitle: string
  hostUserId: number
  applicantUserId: number
  applicantName: string
  status: 'APPROVED' | 'REJECTED'
}

export interface MeetingConfirmedMetadata {
  projectId: number
  projectTitle: string
  recipientIds: number[]
}

export interface MeetingCanceledMetadata {
  projectId: number
  projectTitle: string
  recipientIds: number[]
}

export interface CommentCreatedMetadata {
  projectId: number
  projectTitle: string
  hostId: number
  commenterName: string
}

export type ProjectEventMetadataMap = {
  [ProjectEventType.APPLICATION_SENT]: ApplicationSentMetadata
  [ProjectEventType.APPLICATION_RESPONDED]: ApplicationRespondedMetadata
  [ProjectEventType.MEETING_CONFIRMED]: MeetingConfirmedMetadata
  [ProjectEventType.MEETING_CANCELED]: MeetingCanceledMetadata
  [ProjectEventType.COMMENT_CREATED]: CommentCreatedMetadata
}

export interface ProjectBaseEvent<T extends ProjectEventType> {
  type: T
  metadata: ProjectEventMetadataMap[T]
}
