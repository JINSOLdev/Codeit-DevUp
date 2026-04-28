import { Module } from '@nestjs/common'
import { ProjectLikedModule } from '@data/domain/project-liked'
import { ProjectLikedController } from './project-liked.controller'

@Module({
  imports: [ProjectLikedModule],
  controllers: [ProjectLikedController]
})
export class ProjectLikedHttpModule {}
