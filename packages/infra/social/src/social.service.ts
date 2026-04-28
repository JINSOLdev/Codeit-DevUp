import { Inject, Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common'
import { Apple, Facebook, Github, Google, Kakao, Naver } from './lib'
import { type SocialOptions } from './social.module'
import { FastifyInstance } from 'fastify'
import fastifyOauth2 from '@fastify/oauth2'
import { HttpAdapterHost } from '@nestjs/core'
import { onCloud } from '@data/lib'
import { JwtService } from '@system/jwt'

type Provider = 'apple' | 'facebook' | 'google' | 'github' | 'kakao' | 'naver'

const DEFAULT_REDIRECT_URIS: Partial<Record<Provider, string>> = {
  google: 'http://localhost:3000/auth/callback/google',
  kakao: 'http://localhost:3000/auth/callback/kakao',
  github: 'http://localhost:3000/auth/callback/github'
}
@Injectable()
export class SocialService implements OnApplicationBootstrap {
  static readonly AUDIENCE = 'oauth2'
  static readonly TOKEN_EXPIRE_TIME = 10 * 60
  readonly COOKIE_EXPIRE_TIME = 10 * 60
  readonly REDIRECT_URI_PARAM_COOKIE_NAME = 'redirect-uri'
  private readonly logger = new Logger('SocialService')

  constructor(
    private readonly httpAdapterHost: HttpAdapterHost,
    @Inject('SOCIAL_CONFIG_OPTIONS') private readonly options: SocialOptions,
    private readonly jwtService: JwtService
  ) {}

  async onApplicationBootstrap() {
    const fastify = this.httpAdapterHost.httpAdapter.getInstance<FastifyInstance>()
    const { kakao, facebook, google, github, naver, apple, oauth2Path = '/auth/oauth2', callbackUri } = this.options
    const oauth2Options = {
      kakao: kakao ? Kakao.getOauth2Options({ ...kakao, callbackUri }) : null,
      facebook: facebook ? Facebook.getOauth2Options({ ...facebook, callbackUri }) : null,
      google: google ? Google.getOauth2Options({ ...google, callbackUri }) : null,
      github: github ? Github.getOauth2Options({ ...github, callbackUri }) : null,
      naver: naver ? Naver.getOauth2Options({ ...naver, callbackUri }) : null,
      apple: apple ? Apple.getOauth2Options({ ...apple, callbackUri }) : null
    }
    Object.entries(oauth2Options).forEach(([key, value]) => {
      if (value) {
        fastify.register(fastifyOauth2, { ...value, cookie: { path: oauth2Path, secure: onCloud } })
      }
    })

    fastify.get<{
      Params: {
        provider: Provider
      }
      Querystring: {
        redirect_uri: string
      }
    }>(`${oauth2Path}/authorization/:provider`, async (req, reply) => {
      const provider = req.params.provider
      const oauth2Option = oauth2Options[provider]
      if (!oauth2Option) {
        throw new Error('Invalid provider')
      }

      const fixedRedirectUri = this.options.redirectUris?.[provider] || DEFAULT_REDIRECT_URIS[provider]
      if (!fixedRedirectUri) {
        throw new Error('Redirect URI is not configured')
      }

      // Keep accepting query param for backward compatibility, but block mismatch.
      if (req.query.redirect_uri && req.query.redirect_uri !== fixedRedirectUri) {
        throw new Error('Redirect URI is not allowed')
      }

      reply.setCookie(this.REDIRECT_URI_PARAM_COOKIE_NAME, fixedRedirectUri, {
        path: oauth2Path,
        httpOnly: true,
        secure: onCloud,
        maxAge: this.COOKIE_EXPIRE_TIME
      })
      fastify[oauth2Option.name].generateAuthorizationUri(req, reply, (err, authorizationEndpoint) => {
        if (err) this.logger.error(err)
        reply.redirect(authorizationEndpoint)
      })
    })

    fastify.get<{
      Params: {
        provider: Provider
      }
    }>(`${oauth2Path}/code/:provider`, async (req, reply) => {
      const provider = req.params.provider
      const oauth2Option = oauth2Options[provider]
      if (!oauth2Option) {
        throw new Error('Invalid provider')
      }
      const redirectUri = req.cookies[this.REDIRECT_URI_PARAM_COOKIE_NAME]
      if (!redirectUri) {
        throw new Error('Redirect URI is required')
      }
      const { token } = await fastify[oauth2Option.name].getAccessTokenFromAuthorizationCodeFlow(req)
      const account = await this.getAccountIdFromToken(provider, token.access_token)

      const resUser = {
        email: account.email,
        name: account.name,
        profileImage: account.profileImage,
        gender: account.gender,
        birthday: account.birthday
      }
      const exp = Math.floor(Date.now() / 1000) + SocialService.TOKEN_EXPIRE_TIME
      const resToken = await this.jwtService.createToken({
        sub: account.id.toString(),
        exp,
        aud: SocialService.AUDIENCE,
        email: account.email,
        name: account.name,
        profileImage: account.profileImage,
        gender: account.gender,
        birthday: account.birthday
      })
      const search = new URLSearchParams()
      search.append('token', resToken)
      search.append('type', provider)
      search.append('user', JSON.stringify(resUser))
      reply.redirect(`${redirectUri}?${search.toString()}`, 302)
    })
  }

  async getAccountIdFromToken(
    type: Provider,
    token: string
  ): Promise<
    { id: string; name?: string; email?: string; profileImage?: string; gender?: string; birthday?: string } | undefined
  > {
    if (!this.options[type]) {
      return
    }
    switch (type) {
      case 'apple': {
        return await Apple.getMe(token, [this.options.apple.clientId])
      }
      case 'facebook': {
        return await Facebook.getMe({ access_token: token })
      }
      case 'google': {
        return await Google.getMe(token, this.options.google.clientId)
      }
      case 'github': {
        return await Github.getMe({ access_token: token })
      }
      case 'kakao': {
        return await Kakao.getMe(token)
      }
      case 'naver': {
        return await Naver.getMe(token)
      }
    }
  }
}
