// middleware/auth.ts — 保护 /dashboard/** 路由
export default defineNuxtRouteMiddleware((to) => {
  const authStore = useAuthStore()

  // 加载本地存储的登录态
  if (process.client && !authStore.isLoggedIn) {
    authStore.loadFromStorage()
  }

  const publicRoutes = ['/', '/login', '/join']
  if (publicRoutes.includes(to.path)) return

  if (to.path.startsWith('/dashboard') && !authStore.isLoggedIn) {
    return navigateTo('/login')
  }
})
