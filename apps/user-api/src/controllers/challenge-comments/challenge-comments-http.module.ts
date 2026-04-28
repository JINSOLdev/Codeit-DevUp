import { Module } from '@nestjs/common'
import { ChallengeCommentModule } from '@data/domain/challenge-comments'
import { ChallengeCommentsController } from './challenge-comments.controller'

@Module({
  imports: [ChallengeCommentModule],
  controllers: [ChallengeCommentsController]
})
export class ChallengeCommentsHttpModule {}
