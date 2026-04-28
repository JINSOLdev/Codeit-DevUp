import { Notification } from './notification.entity'
import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { NotificationType, RecipientType, TargetType } from './types/notification.types'
import { GetNotificationsReqDto } from './dto/req/get-notifications.req.dto'
import { GetNotificationsResDto } from './dto/res/get-notifications.res.dto'
import dayjs from 'dayjs'
import { NotificationData, PostNotificationReqDto } from './dto/req/post-notification.req.dto'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'
import { IdParamsDto } from '@data/dto'

dayjs.extend(utc)
dayjs.extend(timezone)

@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(Notification)
    private notificationRepository: Repository<Notification>
  ) {}

  async findAll(
    recipientId: number,
    recipientType: RecipientType,
    params: GetNotificationsReqDto
  ): Promise<GetNotificationsResDto> {
    const { type, isRead, start, perPage } = params
    const queryBuilder = this.notificationRepository
      .createQueryBuilder('notification')
      .where('notification.recipientId = :recipientId', { recipientId })
      .andWhere('notification.recipientType = :recipientType', { recipientType })
      .andWhere('notification.createdAt >= :thirtyDaysAgo', {
        thirtyDaysAgo: dayjs().subtract(30, 'day').toDate()
      })

    if (type) {
      queryBuilder.andWhere('notification.type = :type', { type: type })
    }

    if (typeof isRead === 'boolean') {
      queryBuilder.andWhere('notification.isRead = :isRead', { isRead: isRead })
    }

    const [notifications, total] = await queryBuilder
      .orderBy('notification.createdAt', 'DESC')
      .skip(start)
      .take(perPage)
      .getManyAndCount()

    return {
      data: notifications.map((notification) => ({
        ...notification,
        displayTime: this.formatDisplayTime(notification.createdAt)
      })),
      total
    }
  }

  async create(data: PostNotificationReqDto): Promise<IdParamsDto> {
    const notificationData = data.data || {}

    const notification = new Notification({
      recipientId: data.recipientId,
      recipientType: data.recipientType,
      type: data.type,
      title: this.getNotificationTitle(data.type),
      content: this.getNotificationContent(data.type, notificationData),
      targetInfo: {
        type: this.getTargetType(data.type),
        id: data.targetId
      },
      isRead: false
    })

    const saved = await this.notificationRepository.save(notification)
    return { id: saved.id }
  }

  async updateNotificationStatus(recipientId: number, notificationId: number): Promise<IdParamsDto> {
    const result = await this.notificationRepository
      .createQueryBuilder()
      .update(Notification)
      .set({ isRead: true })
      .where('id = :notificationId', { notificationId })
      .andWhere('recipientId = :recipientId', { recipientId })
      .execute()

    if (result.affected === 0) {
      throw new NotFoundException('not_found_notification_info')
    }

    return { id: notificationId }
  }

  async updateAllNotificationStatus(recipientId: number, recipientType: RecipientType): Promise<void> {
    await this.notificationRepository
      .createQueryBuilder()
      .update(Notification)
      .set({ isRead: true })
      .where('recipientId = :recipientId', { recipientId })
      .andWhere('recipientType = :recipientType', { recipientType })
      .andWhere('isRead = :isRead', { isRead: false })
      .execute()
  }

  async deleteExpiredNotifications(): Promise<number> {
    const thirtyDaysAgo = dayjs().subtract(30, 'day').toDate()
    const result = await this.notificationRepository
      .createQueryBuilder()
      .delete()
      .from(Notification)
      .where('createdAt < :thirtyDaysAgo', { thirtyDaysAgo })
      .execute()

    return result.affected || 0
  }

  private getNotificationTitle(type: NotificationType): string {
    switch (type) {
      case NotificationType.userWelcome:
        return 'DevUp에 오신 걸 환영해요!'
      case NotificationType.projectMeetingConfirmed:
      case NotificationType.challengeMeetingConfirmed:
        return '모임 확정'
      case NotificationType.projectMeetingCanceled:
      case NotificationType.challengeMeetingCanceled:
        return '모임 취소'
      case NotificationType.projectNewComment:
      case NotificationType.challengeNewComment:
        return '새로운 댓글'
      case NotificationType.projectApplicationReceived:
      case NotificationType.challengeApplicationReceived:
        return '참여 승인 요청'
      case NotificationType.projectApplicationApproved:
      case NotificationType.challengeApplicationApproved:
        return '참여 신청 승인'
      case NotificationType.projectApplicationRejected:
      case NotificationType.challengeApplicationRejected:
        return '참여 신청 거절'
      default:
        return '알림'
    }
  }

  private getNotificationContent(type: NotificationType, data: NotificationData): string {
    const { userName = '', projectTitle = '', challengeTitle = '' } = data
    const title = projectTitle || challengeTitle

    switch (type) {
      case NotificationType.userWelcome:
        return '이제 코딩 스킬을 레벨업할 준비가 되셨나요? 프로필을 완성하고, 나에게 맞는 활동을 시작해보세요.'
      case NotificationType.projectMeetingConfirmed:
      case NotificationType.challengeMeetingConfirmed:
        return `'${title}' 모임 개설이 확정되었어요!`
      case NotificationType.projectMeetingCanceled:
      case NotificationType.challengeMeetingCanceled:
        return `'${title}' 모임이 취소되었어요.`
      case NotificationType.projectNewComment:
      case NotificationType.challengeNewComment:
        return `'${userName}'님이 댓글을 작성했어요.`
      case NotificationType.projectApplicationReceived:
      case NotificationType.challengeApplicationReceived:
        return `'${userName}'님이 참여를 요청했어요.`
      case NotificationType.projectApplicationApproved:
      case NotificationType.challengeApplicationApproved:
        return `'${title}' 모임 참여가 승인되었어요!`
      case NotificationType.projectApplicationRejected:
      case NotificationType.challengeApplicationRejected:
        return `'${title}' 모임 참여가 거절되었어요.`
      default:
        return ''
    }
  }

  private formatDisplayTime(date: Date): string {
    const now = dayjs()
    const target = dayjs(date)

    if (now.diff(target, 'minute') < 1) return '방금'
    if (now.diff(target, 'hour') < 1) return `${now.diff(target, 'minute')}분 전`
    if (now.diff(target, 'day') < 1) return `${now.diff(target, 'hour')}시간 전`
    if (now.diff(target, 'day') <= 30) return `${now.diff(target, 'day')}일 전`
    return null
  }

  private getTargetType(type: NotificationType): TargetType {
    switch (type) {
      case NotificationType.projectMeetingConfirmed:
      case NotificationType.projectMeetingCanceled:
      case NotificationType.projectNewComment:
      case NotificationType.projectApplicationReceived:
      case NotificationType.projectApplicationApproved:
      case NotificationType.projectApplicationRejected:
        return TargetType.project
      case NotificationType.challengeMeetingConfirmed:
      case NotificationType.challengeMeetingCanceled:
      case NotificationType.challengeNewComment:
      case NotificationType.challengeApplicationReceived:
      case NotificationType.challengeApplicationApproved:
      case NotificationType.challengeApplicationRejected:
        return TargetType.challenge
      default:
        return TargetType.other
    }
  }
}
