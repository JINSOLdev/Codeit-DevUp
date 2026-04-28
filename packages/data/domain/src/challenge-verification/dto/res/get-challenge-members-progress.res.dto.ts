import { ApiProperty } from '@nestjs/swagger'
import { IsArray, IsNumber, IsString, IsOptional } from 'class-validator'
import { MemberProgressData } from './get-member-progress.res.dto'

export class ChallengeProgressSummary {
  @ApiProperty({ example: 25.5 })
  @IsNumber()
  averageProgress: number

  @ApiProperty({ example: 12 })
  @IsNumber()
  totalMembers: number

  @ApiProperty({ example: 8 })
  @IsNumber()
  activeMembers: number

  @ApiProperty({ example: 3 })
  @IsNumber()
  completedMembers: number

  @ApiProperty({ example: 8 })
  @IsOptional()
  @IsNumber()
  verifiedTodayCount?: number

  @ApiProperty({ example: 5 })
  @IsOptional()
  @IsNumber()
  pendingVerificationCount?: number
}

export class GetChallengeMembersProgressResDto {
  @ApiProperty({ example: '챌린지 멤버 진행 상황이 조회되었습니다.' })
  @IsString()
  message: string

  @ApiProperty({ type: [MemberProgressData] })
  @IsArray()
  members: MemberProgressData[]

  @ApiProperty()
  summary: ChallengeProgressSummary
}
