<template>
  <div class="min-h-screen flex items-center justify-center px-4" style="background: #0f0f0f;">
    <!-- 背景装饰 -->
    <div class="fixed inset-0 pointer-events-none overflow-hidden">
      <div class="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full opacity-5"
           style="background: radial-gradient(circle, #C6A16E, transparent);" />
    </div>

    <div class="w-full max-w-md relative">
      <!-- Logo区 -->
      <div class="text-center mb-10">
        <div class="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4"
             style="background: linear-gradient(135deg, #C6A16E, #8B6914);">
          <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
        </div>
        <h1 class="text-2xl font-semibold text-white">代理商中心</h1>
        <p class="mt-1 text-sm" style="color: #888;">使用账号密码登录管理门户</p>
      </div>

      <!-- 登录表单 -->
      <div class="card p-8">
        <form @submit.prevent="handleLogin" class="space-y-5">
          <div>
            <label class="block text-sm font-medium mb-2" style="color: #aaa;">手机号</label>
            <input
              v-model="phone"
              type="tel"
              class="input"
              placeholder="请输入手机号"
              maxlength="11"
              autocomplete="username"
            />
          </div>

          <div>
            <label class="block text-sm font-medium mb-2" style="color: #aaa;">密码</label>
            <div class="relative">
              <input
                v-model="password"
                :type="showPwd ? 'text' : 'password'"
                class="input pr-10"
                placeholder="请输入密码"
                autocomplete="current-password"
              />
              <button type="button" class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                      @click="showPwd = !showPwd">
                <svg v-if="!showPwd" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                </svg>
              </button>
            </div>
          </div>

          <!-- 错误提示 -->
          <div v-if="error" class="flex items-center gap-2 p-3 rounded-lg text-sm"
               style="background: rgba(248,113,113,0.1); color: #f87171; border: 1px solid rgba(248,113,113,0.2);">
            <svg class="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
            </svg>
            {{ error }}
          </div>

          <button type="submit" class="btn-gold w-full h-11 font-medium" :disabled="loading">
            <svg v-if="loading" class="w-4 h-4 mr-2 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            {{ loading ? '登录中...' : '登录' }}
          </button>
        </form>

        <div class="mt-6 text-center">
          <p class="text-sm" style="color: #555;">
            还不是代理商？
            <NuxtLink to="/join" class="text-gold hover:underline ml-1">了解如何加入</NuxtLink>
          </p>
        </div>
      </div>

      <p class="mt-6 text-center text-xs" style="color: #333;">
        © {{ new Date().getFullYear() }} 品牌代理商中心 · 仅供授权代理商使用
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'blank' })

const { login, loading, error } = useAuth()
const phone = ref('')
const password = ref('')
const showPwd = ref(false)

async function handleLogin() {
  if (!phone.value || !password.value) {
    error.value = '请填写手机号和密码'
    return
  }
  await login(phone.value, password.value)
}

// 已登录则直接跳工作台
const authStore = useAuthStore()
onMounted(() => {
  authStore.loadFromStorage()
  if (authStore.isLoggedIn) {
    navigateTo('/dashboard')
  }
})
</script>
