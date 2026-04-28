import { Module } from '@nestjs/common'
import { ChallengeBookmarkedModule } from '@data/domain/challenge-bookmarked'
import { ChallengeBookmarkedController } from './challenge-bookmarked.controller'

@Module({
  imports: [ChallengeBookmarkedModule],
  controllers: [ChallengeBookmarkedController]
})
export class ChallengeBookmarkedHttpModule {}
