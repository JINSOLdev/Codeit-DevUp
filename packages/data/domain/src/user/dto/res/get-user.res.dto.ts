import { ApiProperty, PickType } from '@nestjs/swagger'
import { IsArray, IsEnum, IsInt, IsObject, IsOptional, ValidateNested } from 'class-validator'
import { Type } from 'class-transformer'
import { User } from '../../entities/user.entity'
import { UserSetting } from '../../entities/user-setting.entity'
import { UserAccountType } from '../../user.type'

export class GetUserResDtoSetting extends PickType(UserSetting, [
  'agreeMarketing',
  'agreeMarketingPhone',
  'agreeMarketingPhoneAt'
] as const) {}

export class GetUserResDtoStats {
  @IsInt()
  @ApiProperty({ type: 'integer', description: '참여 중인 프로젝트 수' })
  projectCount: number

  @IsInt()
  @ApiProperty({ type: 'integer', description: '참여 중인 챌린지 수' })
  challengeCount: number
}

export class GetUserResDto extends PickType(User, [
  'id',
  'email',
  'nickname',
  'jobLabel',
  'bio',
  'profileImageUrl',
  'skills',
  'githubLink',
  'blogLink',
  'portfolioLink',
  'createdAt'
] as const) {
  @IsEnum(UserAccountType, { each: true })
  @ApiProperty({ enum: UserAccountType, isArray: true, description: '연동된 계정 타입 목록' })
  accounts: UserAccountType[]

  // @IsOptional()
  // @IsObject()
  // @ValidateNested()
  // @Type(() => GetUserResDtoSetting)
  // @ApiProperty({ type: () => GetUserResDtoSetting, required: false, description: '알림 설정' })
  // setting?: GetUserResDtoSetting

  @IsObject()
  @ValidateNested()
  @Type(() => GetUserResDtoStats)
  @ApiProperty({ type: () => GetUserResDtoStats, description: '활동 통계' })
  stats: GetUserResDtoStats
}
