import { Injectable, Logger } from '@nestjs/common'
import { Cron } from '@nestjs/schedule'
import { ChallengeService } from '@data/domain/challenge'

@Injectable()
export class UpdateChallengeCron {
  private readonly logger = new Logger(UpdateChallengeCron.name)

  constructor(private challengeService: ChallengeService) {}

  /**
   * 매일 자정(00:00)에 실행
   * 날짜 기준으로 챌린지 상태를 자동 전환:
   * - recruitDeadline 경과 & startDate 미도래 → RECRUITMENT_CLOSED
   * - startDate 도래 & endDate 미경과 → IN_PROGRESS
   * - endDate 경과 → COMPLETED
   */
  @Cron('0 0 * * *', { timeZone: 'Asia/Seoul' })
  async updateChallengeStatus() {
    this.logger.log('Starting daily challenge status update...')

    try {
      const updatedCount = await this.challengeService.updateExpiredChallengeStatuses()
      this.logger.log(`Updated ${updatedCount} challenge status records`)
    } catch (error) {
      this.logger.error('Failed to update challenge statuses', error.stack)
    }
  }
}
