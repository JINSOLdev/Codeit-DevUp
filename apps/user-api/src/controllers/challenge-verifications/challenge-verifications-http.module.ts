import { Module } from '@nestjs/common'
import { ChallengeVerificationModule } from '@data/domain/challenge-verification'
import { ChallengeVerificationsController } from './challenge-verifications.controller'

@Module({
  imports: [ChallengeVerificationModule],
  controllers: [ChallengeVerificationsController]
})
export class ChallengeVerificationsHttpModule {}
