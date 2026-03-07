import { defineStore } from 'pinia'

interface UserInfo {
  id: number
  nickname: string
  avatar_url?: string
  phone?: string
  role_level: number
  agent_level?: number
  balance: number
  invite_code?: string
  member_no?: string
  order_count?: number
  parent_id?: number
}

interface AuthState {
  token: string | null
  user: UserInfo | null
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    token: null,
    user: null
  }),

  getters: {
    isLoggedIn: (state) => !!state.token && !!state.user,
    isAgent: (state) => state.user ? state.user.role_level >= 3 : false,
    agentLevel: (state) => state.user?.agent_level || 1,
    agentLevelName: (state) => {
      const level = state.user?.agent_level || 1
      return level === 1 ? '一级代理' : level === 2 ? '二级代理' : '三级代理'
    }
  },

  actions: {
    setAuth(token: string, user: UserInfo) {
      this.token = token
      this.user = user
      if (process.client) {
        localStorage.setItem('agent_token', token)
        localStorage.setItem('agent_user', JSON.stringify(user))
      }
    },

    loadFromStorage() {
      if (process.client) {
        const token = localStorage.getItem('agent_token')
        const userStr = localStorage.getItem('agent_user')
        if (token && userStr) {
          try {
            this.token = token
            this.user = JSON.parse(userStr)
          } catch {
            this.clearAuth()
          }
        }
      }
    },

    clearAuth() {
      this.token = null
      this.user = null
      if (process.client) {
        localStorage.removeItem('agent_token')
        localStorage.removeItem('agent_user')
      }
    },

    updateUser(user: Partial<UserInfo>) {
      if (this.user) {
        this.user = { ...this.user, ...user }
        if (process.client) {
          localStorage.setItem('agent_user', JSON.stringify(this.user))
        }
      }
    }
  }
})
