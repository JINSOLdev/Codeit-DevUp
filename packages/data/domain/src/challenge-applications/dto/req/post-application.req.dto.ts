import { ApiProperty } from '@nestjs/swagger'
import { PickType } from '@nestjs/swagger'
import { ChallengeApplication } from '../../challenge-application.entity'

export class PostApplicationReqDto extends PickType(ChallengeApplication, [
  'name',
  'githubUrl',
  'motivation'
] as const) {
  @ApiProperty({
    required: false,
    description: 'GitHub URL (선택사항)',
    nullable: true
  })
  githubUrl?: string
}
