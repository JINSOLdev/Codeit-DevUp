import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { ChallengeMember } from './challenge-member.entity'
import { ChallengeMemberService } from './challenge-member.service'
import { ChallengeModule } from '../challenge/challenge.module'
import { UserModule } from '../user/user.module'

@Module({
  imports: [TypeOrmModule.forFeature([ChallengeMember]), ChallengeModule, UserModule],
  providers: [ChallengeMemberService],
  exports: [TypeOrmModule, ChallengeMemberService]
})
export class ChallengeMemberModule {}