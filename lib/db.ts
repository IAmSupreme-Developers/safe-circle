async function api<T>(path: string, token: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'}${path}`, {
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
    posts: {
      list: (limit?: number, mine?: boolean, category?: string) => {
        const p = new URLSearchParams()
        if (limit) p.set('limit', String(limit))
        if (mine) p.set('mine', '1')
        if (category) p.set('category', category)
        const qs = p.toString()
        return r(`/api/posts${qs ? '?' + qs : ''}`)
      },
      get: (id: string) => r(`/api/posts/${id}`),
      create: (data: { content: string; attachments?: string[]; location_lat?: number | null; location_lng?: number | null }) =>
        r('/api/posts', { method: 'POST', ...body(data) }),
      delete: (id: string) => r(`/api/posts/${id}`, { method: 'DELETE' }),
      resolve: (id: string) => r(`/api/posts/${id}`, { method: 'PATCH' }),
    },
    comments: {
      list: (postId: string) => r(`/api/posts/${postId}/comments`),
      create: (postId: string, content: string) =>
        r(`/api/posts/${postId}/comments`, { method: 'POST', ...body({ content }) }),
      delete: (postId: string, commentId: string) =>
        r(`/api/posts/${postId}/comments/${commentId}`, { method: 'DELETE' }),
    },
    zones: {
      list: (trackerId: string) => r(`/api/trackers/${trackerId}/zones`),
      create: (trackerId: string, data: object) =>
        r(`/api/trackers/${trackerId}/zones`, { method: 'POST', ...body(data) }),
      update: (trackerId: string, zoneId: string, data: object) =>
        r(`/api/trackers/${trackerId}/zones/${zoneId}`, { method: 'PATCH', ...body(data) }),
      delete: (trackerId: string, zoneId: string) =>
        r(`/api/trackers/${trackerId}/zones/${zoneId}`, { method: 'DELETE' }),
    },
  }
}
