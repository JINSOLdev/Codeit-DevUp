import { ApiProperty } from '@nestjs/swagger'
import { IsArray, IsEnum, IsInt, IsOptional, IsString, ValidateNested } from 'class-validator'
import { Type } from 'class-transformer'
import { MemberType } from '../../project-member.entity'
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
