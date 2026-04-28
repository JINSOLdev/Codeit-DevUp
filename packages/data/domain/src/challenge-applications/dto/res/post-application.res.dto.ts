import { ApiProperty, PickType } from '@nestjs/swagger'
import { IsString } from 'class-validator'
import { ChallengeApplication } from '../../challenge-application.entity'

export class PostApplicationResDto extends PickType(ChallengeApplication, ['id', 'challengeId', 'status'] as const) {
  @IsString()
  @ApiProperty({ description: '처리 결과 메시지' })
  message: string
}
