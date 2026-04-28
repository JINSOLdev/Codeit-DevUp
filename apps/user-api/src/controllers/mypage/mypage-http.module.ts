import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { User } from '@data/domain/user/entities/user.entity'
import { Project } from '@data/domain/project/project.entity'
import { ProjectMember } from '@data/domain/project-member/project-member.entity'
import { Challenge } from '@data/domain/challenge/challenge.entity'
import { ChallengeMember } from '@data/domain/challenge-member/challenge-member.entity'
import { MyPageController } from './mypage.controller'
import { MyPageService } from '@data/domain/mypage/mypage.service'

@Module({
  imports: [TypeOrmModule.forFeature([User, Project, ProjectMember, Challenge, ChallengeMember])],
  controllers: [MyPageController],
  providers: [MyPageService]
})
export class MyPageHttpModule {}
