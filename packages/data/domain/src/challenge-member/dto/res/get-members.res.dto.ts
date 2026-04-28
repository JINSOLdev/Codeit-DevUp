import { ApiProperty } from '@nestjs/swagger'
import { IsArray, IsBoolean, IsEnum, IsInt, IsOptional, IsString, ValidateNested } from 'class-validator'
import { Type } from 'class-transformer'
import { MemberType } from '../../challenge-member.entity'
import { UserSummaryDto } from '../../../user/dto/res/user-summary.res.dto'

export class GetMembersResDtoItem {
  @IsInt()
  @ApiProperty({ type: 'integer' })
  id: number

  @IsInt()
  @ApiProperty({ type: 'integer' })
  userId: number

  @IsEnum(MemberType)
  @ApiProperty({ enum: MemberType, description: '멤버 유형' })
  memberType: MemberType

  @IsOptional()
  @IsString()
  @ApiProperty({ description: '담당 포지션', required: false, nullable: true })
  position?: string

  @ApiProperty({ description: '참여일' })
  joinedAt: Date

  @IsBoolean()
  @ApiProperty({ description: '검증 완료 상태' })
  isVerified: boolean

  @IsInt()
  @ApiProperty({ type: 'integer', description: '검증 횟수' })
  verificationCount: number

  @ValidateNested()
  @Type(() => UserSummaryDto)
  @ApiProperty({ type: UserSummaryDto, description: '멤버 유저 정보' })
  user: UserSummaryDto
}

export class GetMembersResDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => GetMembersResDtoItem)
  @ApiProperty({ type: [GetMembersResDtoItem] })
  data: GetMembersResDtoItem[]

  @IsInt()
  @ApiProperty({ type: 'integer' })
  total: number
}
