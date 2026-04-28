import { ApiProperty, PickType } from '@nestjs/swagger'
import { IsArray, IsInt, ValidateNested, IsOptional, IsString, IsUrl } from 'class-validator'
import { Type } from 'class-transformer'
import { ChallengeApplication } from '../../challenge-application.entity'

export class ApplicationUserDto {
  @IsString()
  @ApiProperty({ description: 'User nickname' })
  nickname: string

  @IsOptional()
  @IsUrl()
  @ApiProperty({ description: 'User profile image URL', required: false })
  profileImageUrl?: string
}

export class GetApplicationsResDtoItem extends PickType(ChallengeApplication, [
  'id',
  'userId',
  'githubUrl',
  'motivation',
  'status',
  'createdAt'
] as const) {
  @ValidateNested()
  @Type(() => ApplicationUserDto)
  @ApiProperty({ type: ApplicationUserDto })
  user: ApplicationUserDto
}

export class GetApplicationsResDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => GetApplicationsResDtoItem)
  @ApiProperty({ type: [GetApplicationsResDtoItem] })
  data: GetApplicationsResDtoItem[]

  @IsInt()
  @ApiProperty({ type: 'integer' })
  total: number
}
