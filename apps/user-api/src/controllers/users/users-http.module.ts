import { User, UserAccount, ProjectMember, ChallengeMember } from '@data/domain'
import { UserService } from '@data/domain/user'
import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { UsersController } from './users.controller'

@Module({
  imports: [TypeOrmModule.forFeature([User, UserAccount, ProjectMember, ChallengeMember])],
  controllers: [UsersController],
  providers: [UserService],
  exports: [UserService]
})
export class UsersHttpModule {}
