import { ApiProperty } from '@nestjs/swagger'
import { IsString } from 'class-validator'

export class DeleteChallengeVerificationResDto {
  @ApiProperty({ example: '인증이 삭제되었습니다.' })
  @IsString()
  message: string
}
