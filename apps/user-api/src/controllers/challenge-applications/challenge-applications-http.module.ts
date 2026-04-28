import { Module } from '@nestjs/common'
import { ChallengeApplicationModule } from '@data/domain/challenge-applications/challenge-application.module'
import { ChallengeApplicationsController } from './challenge-applications.controller'

@Module({
  imports: [ChallengeApplicationModule],
  controllers: [ChallengeApplicationsController]
})
export class ChallengeApplicationsHttpModule {}
