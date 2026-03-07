// composables/useAuth.ts
export function useAuth() {
  const authStore = useAuthStore()
  const router = useRouter()
  const { post } = useApi()

  const loading = ref(false)
  const error = ref('')

  async function login(phone: string, password: string) {
    loading.value = true
    error.value = ''
    try {
      const res = await post<{ token: string; user: any }>('/api/auth/login', { phone, password })
      authStore.setAuth(res.token, res.user)
      await router.push('/dashboard')
    } catch (e: any) {
      error.value = e.message || '登录失败，请检查账号密码'
    } finally {
      loading.value = false
    }
  }

  function logout() {
    authStore.clearAuth()
    router.push('/login')
  }

  function init() {
    authStore.loadFromStorage()
  }

  return { login, logout, init, loading, error }
}
