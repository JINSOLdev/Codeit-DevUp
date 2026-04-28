import { ApiPropertyOptional, PartialType } from '@nestjs/swagger'
import { IsEnum, IsOptional } from 'class-validator'
import { ChallengeStatus } from '../../challenge.entity'
import { PostChallengeReqDto } from './post-challenge.req.dto'

export class PatchChallengeReqDto extends PartialType(PostChallengeReqDto) {
  @IsOptional()
  @IsEnum(ChallengeStatus)
  @ApiPropertyOptional({ enum: ChallengeStatus, enumName: 'ChallengeStatus' })
  status?: ChallengeStatus
}
