import { PickType } from '@nestjs/swagger'
import { ChallengeApplication } from '../../challenge-application.entity'

export class PatchApplicationRejectReqDto extends PickType(ChallengeApplication, [
  'reasonCategory',
  'reasonDetail'
] as const) {}
