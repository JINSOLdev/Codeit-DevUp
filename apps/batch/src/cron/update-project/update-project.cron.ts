import { Injectable, Logger } from '@nestjs/common'
import { Cron } from '@nestjs/schedule'
import { ProjectService } from '@data/domain/project'

@Injectable()
export class UpdateProjectCron {
  private readonly logger = new Logger(UpdateProjectCron.name)

  constructor(private projectService: ProjectService) {}

  /**
   * 매일 자정(00:00)에 실행
   * 날짜 기준으로 프로젝트 상태를 자동 전환:
   * - recruitEndDate 경과 & projectStartDate 미도래 → RECRUITMENT_CLOSED
   * - projectStartDate 도래 & projectEndDate 미경과 → IN_PROGRESS
   * - projectEndDate 경과 → COMPLETED
   */
  @Cron('0 0 * * *', { timeZone: 'Asia/Seoul' })
  async updateProjectStatus() {
    this.logger.log('Starting daily project status update...')

    try {
      const updatedCount = await this.projectService.updateExpiredProjectStatuses()
      this.logger.log(`Updated ${updatedCount} project status records`)
    } catch (error) {
      this.logger.error('Failed to update project statuses', error.stack)
    }
  }
}
