import { IsEnum, IsString } from 'class-validator'

export enum GetAuthOauth2Type {
  apple = 'apple',
  google = 'google',
  facebook = 'facebook',
  kakao = 'kakao',
  naver = 'naver',
  github = 'github'
}

export class GetAuthOauth2ReqDto {
  @IsEnum(GetAuthOauth2Type)
  type: GetAuthOauth2Type

  @IsString()
  redirect_uri: string
}
