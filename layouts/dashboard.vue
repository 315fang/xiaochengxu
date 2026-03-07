<template>
  <div class="flex h-screen overflow-hidden" style="background: #0f0f0f;">
    <!-- 侧边栏（桌面端） -->
    <aside :class="['flex-shrink-0 flex flex-col border-r transition-all duration-300 z-30',
                    sidebarOpen ? 'w-56' : 'w-16',
                    'hidden md:flex']"
           style="background: #111; border-color: #1e1e1e;">
      <!-- Logo -->
      <div class="flex items-center h-16 px-4 border-b flex-shrink-0" style="border-color: #1e1e1e;">
        <div class="w-8 h-8 flex-shrink-0 rounded-lg flex items-center justify-center"
             style="background: linear-gradient(135deg, #C6A16E, #8B6914);">
          <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
        </div>
        <span v-if="sidebarOpen" class="ml-3 font-semibold text-white text-sm truncate">代理商中心</span>
        <button class="ml-auto p-1 rounded hover:bg-white/5 transition-colors" @click="sidebarOpen = !sidebarOpen">
          <svg class="w-4 h-4" style="color: #555;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      <!-- 导航菜单 -->
      <nav class="flex-1 overflow-y-auto py-4 space-y-1 px-2">
        <NuxtLink
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          :class="['flex items-center rounded-lg px-2 py-2 text-sm transition-all duration-200 group',
                   isActive(item.to)
                     ? 'bg-gold/10 text-gold font-medium'
                     : 'hover:bg-white/5 text-gray-400 hover:text-gray-200']"
          :title="!sidebarOpen ? item.label : ''"
        >
          <component :is="item.icon" class="w-5 h-5 flex-shrink-0" />
          <span v-if="sidebarOpen" class="ml-3 truncate">{{ item.label }}</span>
          <span v-if="sidebarOpen && item.badge" class="ml-auto badge badge-approved text-xs">{{ item.badge }}</span>
        </NuxtLink>
      </nav>

      <!-- 用户信息 -->
      <div class="border-t p-3 flex-shrink-0" style="border-color: #1e1e1e;">
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 flex-shrink-0 rounded-full flex items-center justify-center text-xs font-bold"
               style="background: rgba(198,161,110,0.2); color: #C6A16E;">
            {{ userInitial }}
          </div>
          <div v-if="sidebarOpen" class="flex-1 min-w-0">
            <div class="text-sm font-medium text-white truncate">{{ authStore.user?.nickname || '代理商' }}</div>
            <div class="text-xs text-gold">{{ authStore.agentLevelName }}</div>
          </div>
          <button v-if="sidebarOpen" class="p-1 rounded hover:bg-white/5 transition-colors" @click="handleLogout" title="退出登录">
            <svg class="w-4 h-4" style="color: #555;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </div>
    </aside>

    <!-- 主体 -->
    <div class="flex-1 flex flex-col min-w-0 overflow-hidden">
      <!-- 顶部 Header -->
      <header class="flex-shrink-0 h-16 flex items-center px-6 gap-4 border-b" style="background: #111; border-color: #1e1e1e;">
        <!-- 移动端 菜单按钮 -->
        <button class="md:hidden p-2 rounded-lg hover:bg-white/5" @click="mobileMenuOpen = true">
          <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <!-- 页面标题 -->
        <h1 class="text-base font-semibold text-white flex-1">{{ currentPageTitle }}</h1>

        <!-- 余额快显 -->
        <div class="hidden sm:flex items-center gap-2 px-4 py-1.5 rounded-lg" style="background: #1a1a1a; border: 1px solid #2a2a2a;">
          <svg class="w-4 h-4 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span class="text-sm font-medium text-gold">¥{{ formatMoney(authStore.user?.balance) }}</span>
          <NuxtLink to="/dashboard/withdraw" class="text-xs px-2 py-0.5 rounded" style="background: rgba(198,161,110,0.1); color: #C6A16E;">提现</NuxtLink>
        </div>

        <!-- 通知 & 头像 -->
        <div class="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold cursor-pointer"
             style="background: rgba(198,161,110,0.2); color: #C6A16E;">
          {{ userInitial }}
        </div>
      </header>

      <!-- 内容区 -->
      <main class="flex-1 overflow-y-auto p-6">
        <NuxtPage />
      </main>
    </div>

    <!-- 移动端抽屉菜单 -->
    <Teleport to="body">
      <div v-if="mobileMenuOpen" class="fixed inset-0 z-50 md:hidden">
        <div class="absolute inset-0 bg-black/60" @click="mobileMenuOpen = false" />
        <div class="absolute left-0 top-0 bottom-0 w-64 flex flex-col border-r" style="background: #111; border-color: #1e1e1e;">
          <div class="flex items-center justify-between h-16 px-4 border-b" style="border-color: #1e1e1e;">
            <span class="font-semibold text-white">代理商中心</span>
            <button class="p-1" @click="mobileMenuOpen = false">
              <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <nav class="flex-1 py-4 space-y-1 px-3">
            <NuxtLink v-for="item in navItems" :key="item.to" :to="item.to"
                      :class="['flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors',
                               isActive(item.to) ? 'bg-gold/10 text-gold font-medium' : 'text-gray-400 hover:bg-white/5 hover:text-gray-200']"
                      @click="mobileMenuOpen = false">
              <component :is="item.icon" class="w-5 h-5 flex-shrink-0" />
              {{ item.label }}
            </NuxtLink>
          </nav>
          <div class="border-t p-4" style="border-color: #1e1e1e;">
            <button class="flex items-center gap-2 text-sm text-gray-400 hover:text-white" @click="handleLogout">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              退出登录
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

const authStore = useAuthStore()
const route = useRoute()
const { logout } = useAuth()

const sidebarOpen = ref(true)
const mobileMenuOpen = ref(false)

const userInitial = computed(() => {
  const name = authStore.user?.nickname || '代'
  return name.charAt(0).toUpperCase()
})

function formatMoney(val: number | undefined | null) {
  return (Number(val) || 0).toFixed(2)
}

const navItems = [
  { to: '/dashboard', label: '工作台', icon: resolveComponent('IconLayoutDashboard') },
  { to: '/dashboard/commissions', label: '佣金明细', icon: resolveComponent('IconCoins') },
  { to: '/dashboard/withdraw', label: '提现', icon: resolveComponent('IconArrowUpCircle') },
  { to: '/dashboard/team', label: '我的团队', icon: resolveComponent('IconUsers') },
  { to: '/dashboard/orders', label: '代理订单', icon: resolveComponent('IconShoppingBag') },
  { to: '/dashboard/stock', label: '云仓库存', icon: resolveComponent('IconPackage') },
]

const pageTitles: Record<string, string> = {
  '/dashboard': '工作台',
  '/dashboard/commissions': '佣金明细',
  '/dashboard/withdraw': '提现',
  '/dashboard/team': '我的团队',
  '/dashboard/orders': '代理订单',
  '/dashboard/stock': '云仓库存',
}

const currentPageTitle = computed(() => pageTitles[route.path] || '工作台')

function isActive(path: string) {
  if (path === '/dashboard') return route.path === '/dashboard'
  return route.path.startsWith(path)
}

function handleLogout() {
  mobileMenuOpen.value = false
  logout()
}
</script>
