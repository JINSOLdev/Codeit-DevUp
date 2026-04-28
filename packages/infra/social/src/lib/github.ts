import { type FastifyOAuth2Options } from '@fastify/oauth2'
import oauthPlugin from '@fastify/oauth2'

function getOauth2Options(options: {
  clientId: string
  clientSecret: string
  callbackUri: string
  scope?: string[]
}): FastifyOAuth2Options {
  const { clientId, clientSecret, callbackUri, scope = ['user:email'] } = options
  return {
    name: 'githubOauth2',
    scope,
    credentials: {
      client: {
        id: clientId,
        secret: clientSecret
      },
      auth: oauthPlugin.GITHUB_CONFIGURATION
    },
    callbackUri: `${callbackUri}/github`
  }
}

async function getMe(options: { access_token: string }) {
  try {
    const response = await fetch('https://api.github.com/user', {
      headers: {
        Authorization: `token ${options.access_token}`,
        'User-Agent': 'OAuth-App'
      }
    })
    if (!response.ok) {
      throw new Error(`github_user_fetch_failed:${response.status}`)
    }
    const user = await response.json()

    // Get user email if not public
    if (!user.email) {
      const emailResponse = await fetch('https://api.github.com/user/emails', {
        headers: {
          Authorization: `token ${options.access_token}`,
          'User-Agent': 'OAuth-App'
        }
      })
      if (emailResponse.ok) {
        const emails = await emailResponse.json()
        if (Array.isArray(emails)) {
          const primaryEmail =
            emails.find((email: any) => email?.primary) ?? emails.find((email: any) => email?.verified)
          user.email = primaryEmail?.email
        }
      }
    }

    return {
      id: user.id.toString(),
      name: user.name,
      email: user.email,
      profileImage: user.avatar_url ?? null
    }
  } catch (e) {
    throw new Error(e instanceof Error ? e.message : String(e))
  }
}

export { getMe, getOauth2Options }
