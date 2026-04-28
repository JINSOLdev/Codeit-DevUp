import { Module } from '@nestjs/common'
import { ChallengeMemberModule } from '@data/domain/challenge-member'
import { ChallengeMemberController } from './challenge-member.controller'

@Module({
  imports: [ChallengeMemberModule],
  controllers: [ChallengeMemberController]
})
export class ChallengeMemberHttpModule {}
