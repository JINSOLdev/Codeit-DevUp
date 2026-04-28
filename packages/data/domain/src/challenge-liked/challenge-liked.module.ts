import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { ChallengeLiked } from './challenge-liked.entity'
import { ChallengeLikedService } from './challenge-liked.service'

@Module({
  imports: [TypeOrmModule.forFeature([ChallengeLiked])],
  providers: [ChallengeLikedService],
  exports: [TypeOrmModule, ChallengeLikedService]
})
export class ChallengeLikedModule {}
