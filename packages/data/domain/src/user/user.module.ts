import { User, UserAccount, UserPassword, UserSetting } from '..'
import { SocialModule } from '@infra/social'
import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { UserService } from './user.service'
import { Verification } from '../verification/verification.entity'
import { ProjectMember } from '../project-member/project-member.entity'
import { ChallengeMember } from '../challenge-member/challenge-member.entity'
import { AwsModule } from '@infra/aws'

@Module({
  imports: [
    AwsModule,
    SocialModule,
    TypeOrmModule.forFeature([
      User,
      UserAccount,
      UserPassword,
      UserSetting,
      Verification,
      ProjectMember,
      ChallengeMember
    ])
  ],
  providers: [UserService],
  exports: [TypeOrmModule, UserService]
})
export class UserModule {}
