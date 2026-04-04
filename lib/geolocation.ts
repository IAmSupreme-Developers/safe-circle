type GeoResult = { lat: number; lng: number }

async function isNative(): Promise<boolean> {
  try {
    const { Capacitor } = await import('@capacitor/core')
    return Capacitor.isNativePlatform()
  } catch { return false }
}

export async function getCurrentPosition(): Promise<GeoResult> {
  if (await isNative()) {
    const { Geolocation } = await import('@capacitor/geolocation')
    await Geolocation.requestPermissions()
    const pos = await Geolocation.getCurrentPosition({ enableHighAccuracy: true })
    return { lat: pos.coords.latitude, lng: pos.coords.longitude }
  }

  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      pos => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      err => reject(new Error(err.message))
    )
  })
}

export async function watchPosition(callback: (pos: GeoResult) => void): Promise<() => void> {
  if (await isNative()) {
    const { Geolocation } = await import('@capacitor/geolocation')
    await Geolocation.requestPermissions()
    const id = await Geolocation.watchPosition({ enableHighAccuracy: true }, pos => {
      if (pos) callback({ lat: pos.coords.latitude, lng: pos.coords.longitude })
    })
    return () => Geolocation.clearWatch({ id })
  }

  const id = navigator.geolocation.watchPosition(
    pos => callback({ lat: pos.coords.latitude, lng: pos.coords.longitude })
  )
  return () => navigator.geolocation.clearWatch(id)
}
