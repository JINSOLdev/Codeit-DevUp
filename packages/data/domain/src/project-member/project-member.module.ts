import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { ProjectMember } from './project-member.entity'
import { ProjectMemberService } from './project-member.service'
import { ProjectModule } from '../project/project.module'
import { UserModule } from '../user/user.module'

@Module({
  imports: [TypeOrmModule.forFeature([ProjectMember]), ProjectModule, UserModule],
  providers: [ProjectMemberService],
  exports: [TypeOrmModule, ProjectMemberService]
})
export class ProjectMemberModule {}
