import { PickType } from '@nestjs/swagger'
import { User } from '../../entities/user.entity'

export class UserSummaryDto extends PickType(User, [
  'id',
  'nickname',
  'jobLabel',
  'profileImageUrl',
  'skills'
] as const) {}
