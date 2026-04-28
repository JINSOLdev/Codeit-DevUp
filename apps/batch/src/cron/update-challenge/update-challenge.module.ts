import { Module } from '@nestjs/common'
import { ChallengeModule } from '@data/domain/challenge'
import { UpdateChallengeCron } from './update-challenge.cron'

@Module({
  imports: [ChallengeModule],
  providers: [UpdateChallengeCron]
})
export class UpdateChallengeModule {}
