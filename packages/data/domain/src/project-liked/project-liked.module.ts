import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { ProjectLiked } from './project-liked.entity'
import { ProjectLikedService } from './project-liked.service'
import { Project } from '../project/project.entity'

@Module({
  imports: [TypeOrmModule.forFeature([ProjectLiked, Project])],
  providers: [ProjectLikedService],
  exports: [TypeOrmModule, ProjectLikedService]
})
export class ProjectLikedModule {}
