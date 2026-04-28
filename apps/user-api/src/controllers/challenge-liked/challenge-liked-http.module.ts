import { Module } from '@nestjs/common'
import { ChallengeLikedModule } from '@data/domain/challenge-liked'
import { ChallengeLikedController } from './challenge-liked.controller'

@Module({
  imports: [ChallengeLikedModule],
  controllers: [ChallengeLikedController]
})
export class ChallengeLikedHttpModule {}
