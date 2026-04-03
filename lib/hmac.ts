/** Sign a payload string with HMAC-SHA256, returns hex digest */
export async function signPayload(payload: string, secret: string): Promise<string> {
  const enc = new TextEncoder()
  const key = await crypto.subtle.importKey(
    'raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
  )
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(payload))
  return Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2, '0')).join('')
}

/** Verify a payload against a provided signature */
export async function verifyPayload(payload: string, signature: string, secret: string): Promise<boolean> {
  const expected = await signPayload(payload, secret)
  return expected === signature
}
