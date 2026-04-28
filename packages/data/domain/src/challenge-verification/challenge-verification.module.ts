import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { ChallengeVerificationService } from './challenge-verification.service'
import { ChallengeVerification } from './challenge-verification.entity'
import { ChallengeModule } from '../challenge/challenge.module'
import { UserModule } from '../user/user.module'

@Module({
  imports: [TypeOrmModule.forFeature([ChallengeVerification]), ChallengeModule, UserModule],
  providers: [ChallengeVerificationService],
  exports: [ChallengeVerificationService]
})
export class ChallengeVerificationModule {}
