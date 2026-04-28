import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { ChallengeApplication } from './challenge-application.entity'
import { ChallengeApplicationService } from './challenge-application.service'
import { ChallengeModule } from '../challenge/challenge.module'
import { ChallengeMember } from '../challenge-member/challenge-member.entity'
import { ChallengeEventModule } from '../event-emitter/challenge-event/challenge-event.module'

@Module({
  imports: [TypeOrmModule.forFeature([ChallengeApplication, ChallengeMember]), ChallengeModule, ChallengeEventModule],
  providers: [ChallengeApplicationService],
  exports: [TypeOrmModule, ChallengeApplicationService]
})
export class ChallengeApplicationModule {}
