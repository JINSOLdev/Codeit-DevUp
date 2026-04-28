import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { ChallengeComment } from './challenge-comment.entity'
import { ChallengeCommentService } from './challenge-comment.service'
import { Challenge } from '../challenge/challenge.entity'
import { ChallengeEventModule } from '../event-emitter/challenge-event/challenge-event.module'

@Module({
  imports: [TypeOrmModule.forFeature([ChallengeComment, Challenge]), ChallengeEventModule],
  providers: [ChallengeCommentService],
  exports: [TypeOrmModule, ChallengeCommentService]
})
export class ChallengeCommentModule {}
