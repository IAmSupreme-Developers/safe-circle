import { Filesystem, Directory, Encoding } from '@capacitor/filesystem'

const DIR = Directory.Data

async function isNative(): Promise<boolean> {
  try {
    const { Capacitor } = await import('@capacitor/core')
    return Capacitor.isNativePlatform()
  } catch { return false }
}

export async function storageGet<T>(key: string): Promise<T | null> {
  if (!(await isNative())) {
    const v = localStorage.getItem(key)
    return v ? JSON.parse(v) : null
  }
  try {
    const { data } = await Filesystem.readFile({ path: `${key}.json`, directory: DIR, encoding: Encoding.UTF8 })
    return JSON.parse(data as string)
  } catch { return null }
}

export async function storageSet(key: string, value: unknown): Promise<void> {
  if (!(await isNative())) {
    localStorage.setItem(key, JSON.stringify(value))
    return
  }
  await Filesystem.writeFile({
    path: `${key}.json`, directory: DIR,
    encoding: Encoding.UTF8, data: JSON.stringify(value), recursive: true,
  })
}

export async function storageRemove(key: string): Promise<void> {
  if (!(await isNative())) { localStorage.removeItem(key); return }
  try { await Filesystem.deleteFile({ path: `${key}.json`, directory: DIR }) } catch {}
}
