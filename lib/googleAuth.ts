import { supabase } from '@/lib/supabase'

const APP_SCHEME = 'developers.iamsupreme.safecircle'

async function isNative(): Promise<boolean> {
  try {
    const { Capacitor } = await import('@capacitor/core')
    return Capacitor.isNativePlatform()
  } catch { return false }
}

export async function signInWithGoogle(): Promise<void> {
  if (await isNative()) {
    const { Browser } = await import('@capacitor/browser')
    const { App } = await import('@capacitor/app')

    const redirectTo = `${APP_SCHEME}://login-callback`

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo, skipBrowserRedirect: true },
    })
    if (error || !data.url) throw error

    await Browser.open({ url: data.url, windowName: '_self' })

    // Listen for the deep link callback
    return new Promise((resolve, reject) => {
      App.addListener('appUrlOpen', async ({ url }) => {
        await Browser.close()
        // Extract tokens from the URL fragment/query
        const urlObj = new URL(url)
        const params = new URLSearchParams(
          urlObj.hash ? urlObj.hash.slice(1) : urlObj.search.slice(1)
        )
        const accessToken = params.get('access_token')
        const refreshToken = params.get('refresh_token')
        if (accessToken && refreshToken) {
          const { error } = await supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken })
          if (error) reject(error)
          else resolve()
        } else {
          reject(new Error('No tokens in callback URL'))
        }
      })
    })
  }

  // Web — standard redirect
  await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: `${window.location.origin}/dashboard` },
  })
}
