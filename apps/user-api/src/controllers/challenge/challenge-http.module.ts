import { Module } from '@nestjs/common'
import { ChallengeModule } from '@data/domain/challenge'
import { ChallengeController } from './challenge.controller'

@Module({
  imports: [ChallengeModule],
  controllers: [ChallengeController]
})
export class ChallengeHttpModule {}
