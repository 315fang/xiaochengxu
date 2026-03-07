// composables/useApi.ts
// 封装 $fetch，自动携带 Authorization header，统一错误处理

export function useApi() {
  const config = useRuntimeConfig()
  const authStore = useAuthStore()

  const BASE = config.public.apiBase

  async function request<T = any>(
    path: string,
    options: RequestInit & { params?: Record<string, any> } = {}
  ): Promise<T> {
    const { params, ...fetchOptions } = options

    let url = `${BASE}${path}`
    if (params) {
      const query = new URLSearchParams(
        Object.fromEntries(
          Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== '')
          .map(([k, v]) => [k, String(v)])
        )
      ).toString()
      if (query) url += `?${query}`
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(fetchOptions.headers as Record<string, string> || {})
    }

    if (authStore.token) {
      headers['Authorization'] = `Bearer ${authStore.token}`
    }

    const res = await $fetch<{ code: number; data: T; message?: string }>(url, {
      ...fetchOptions,
      headers
    })

    if (res.code !== 0) {
      throw new Error(res.message || '请求失败')
    }

    return res.data
  }

  const get = <T = any>(path: string, params?: Record<string, any>) =>
    request<T>(path, { method: 'GET', params })

  const post = <T = any>(path: string, body?: any) =>
    request<T>(path, { method: 'POST', body: JSON.stringify(body) })

  const put = <T = any>(path: string, body?: any) =>
    request<T>(path, { method: 'PUT', body: JSON.stringify(body) })

  const del = <T = any>(path: string) =>
    request<T>(path, { method: 'DELETE' })

  return { get, post, put, del, request }
}
