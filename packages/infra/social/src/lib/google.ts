import { OAuth2Client } from 'google-auth-library'
import { type FastifyOAuth2Options } from '@fastify/oauth2'
import oauthPlugin from '@fastify/oauth2'

function getOauth2Options(options: {
  clientId?: string
  clientSecret?: string
  callbackUri: string
  scope?: string[]
}): FastifyOAuth2Options {
  const { clientId, clientSecret, callbackUri, scope = ['openid', 'email', 'profile'] } = options
  return {
    name: 'googleOauth2',
    scope,
    credentials: {
      client: {
        id: clientId,
        secret: clientSecret
      },
      auth: oauthPlugin.GOOGLE_CONFIGURATION
    },
    callbackUri: `${callbackUri}/google`
  }
}

async function getMe(accessToken: string, _clientId: string) {
  try {
    const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Google userinfo request failed: ${response.status} ${errorText}`)
    }

    const payload = await response.json()

    return {
      id: payload.sub,
      name: payload.name,
      email: payload.email,
      profileImage: payload.picture ?? null
    }
  } catch (e) {
    if (e instanceof Error) {
      throw e
    }
    throw new Error(`Failed to fetch Google user info`)
  }
}

export { getMe, getOauth2Options }
