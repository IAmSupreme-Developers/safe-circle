async function api<T>(path: string, token: string, options?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...(options?.headers ?? {}),
    },
  })
  if (!res.ok) throw new Error((await res.json()).error ?? res.statusText)
  return res.json()
}

export function createDb(token: string) {
  const r = (path: string, options?: RequestInit) => api(path, token, options)
  const body = (data: object) => ({ body: JSON.stringify(data) })

  return {
    profile: {
      get: () => r('/api/profile'),
      update: (data: object) => r('/api/profile', { method: 'PATCH', ...body(data) }),
    },
    trackers: {
      list: () => r('/api/trackers'),
      register: (data: { label: string; device_id: string; code: string }) =>
        r('/api/trackers', { method: 'POST', ...body(data) }),
      update: (id: string, data: object) =>
        r(`/api/trackers/${id}`, { method: 'PATCH', ...body(data) }),
      delete: (id: string) => r(`/api/trackers/${id}`, { method: 'DELETE' }),
    },
    alerts: {
      list: (limit?: number) => r(`/api/alerts${limit ? `?limit=${limit}` : ''}`),
      markRead: (id: string) => r(`/api/alerts/${id}`, { method: 'PATCH' }),
      markAllRead: () => r('/api/alerts', { method: 'PATCH' }),
    },
  }
}
