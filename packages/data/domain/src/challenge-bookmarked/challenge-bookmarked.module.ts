import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { ChallengeBookmarked } from './challenge-bookmarked.entity'
import { ChallengeBookmarkedService } from './challenge-bookmarked.service'

@Module({
  imports: [TypeOrmModule.forFeature([ChallengeBookmarked])],
  providers: [ChallengeBookmarkedService],
  exports: [TypeOrmModule, ChallengeBookmarkedService]
})
export class ChallengeBookmarkedModule {}
