import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Challenge } from './challenge.entity'
import { ChallengeService } from './challenge.service'
import { ChallengeMember } from '../challenge-member/challenge-member.entity'
import { ChallengeApplication } from '../challenge-applications/challenge-application.entity'
import { ChallengeLiked } from '../challenge-liked/challenge-liked.entity'
import { ChallengeVerification } from '../challenge-verification/challenge-verification.entity'
import { ChallengeEventModule } from '../event-emitter/challenge-event/challenge-event.module'

@Module({
  imports: [
    TypeOrmModule.forFeature([Challenge, ChallengeMember, ChallengeApplication, ChallengeLiked, ChallengeVerification]),
    ChallengeEventModule
  ],
  providers: [ChallengeService],
  exports: [TypeOrmModule, ChallengeService]
})
export class ChallengeModule {}
