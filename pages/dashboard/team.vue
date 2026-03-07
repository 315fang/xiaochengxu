<template>
  <div>
    <!-- 邀请码 + 统计 -->
    <div class="grid md:grid-cols-3 gap-4 mb-6">
      <div class="card p-5">
        <div class="text-sm mb-2" style="color: #888;">我的邀请码</div>
        <div class="flex items-center gap-3">
          <span class="text-2xl font-bold font-mono text-gold">{{ authStore.user?.invite_code || '--' }}</span>
          <button class="btn-ghost text-xs px-3 py-1 border rounded" style="border-color: #2a2a2a;"
                  @click="copyCode">
            复制
          </button>
        </div>
        <p class="text-xs mt-2" style="color: #555;">分享邀请码，直推成员加入即可绑定关系</p>
      </div>
      <StatCard label="直推成员" :value="stats.direct_members || 0" suffix="人" :icon="IconUsers" iconColor="96,165,250" />
      <StatCard label="全团队" :value="stats.total_members || 0" suffix="人" :icon="IconUsers" iconColor="74,222,128"
                :sub="`间推 ${(stats.total_members || 0) - (stats.direct_members || 0)} 人`" />
    </div>

    <!-- 筛选 -->
    <div class="flex flex-wrap items-center gap-3 mb-4">
      <input v-model="keyword" class="input w-56 text-sm" placeholder="搜索昵称或手机号" @input="debouncedSearch" />
      <select v-model="levelFilter" class="input w-auto text-sm py-2" @change="loadTeam()">
        <option value="">全部等级</option>
        <option value="1">直推（一级）</option>
        <option value="2">间推（二级）</option>
      </select>
      <select v-model="roleFilter" class="input w-auto text-sm py-2" @change="loadTeam()">
        <option value="">全部角色</option>
        <option value="0">普通用户</option>
        <option value="1">会员</option>
        <option value="2">团长</option>
        <option value="3">代理商</option>
      </select>
    </div>

    <!-- 团队列表 -->
    <div class="card overflow-hidden">
      <div v-if="loading" class="p-8 text-center text-sm" style="color: #555;">加载中...</div>
      <div v-else-if="members.length === 0" class="p-12 text-center">
        <div class="text-4xl mb-3">👥</div>
        <div class="text-sm" style="color: #555;">暂无团队成员</div>
        <div class="mt-4 text-xs" style="color: #444;">分享你的邀请码 <strong class="text-gold">{{ authStore.user?.invite_code }}</strong> 邀请好友加入</div>
      </div>
      <div v-else class="overflow-x-auto">
        <table class="table-base">
          <thead>
            <tr>
              <th>成员</th>
              <th>层级</th>
              <th>角色</th>
              <th>有效订单</th>
              <th>加入时间</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="m in members" :key="m.id">
              <td>
                <div class="flex items-center gap-3">
                  <div class="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                       style="background: rgba(198,161,110,0.15); color: #C6A16E;">
                    {{ (m.nickname || '用').charAt(0) }}
                  </div>
                  <div>
                    <div class="text-sm font-medium text-white">{{ m.nickname || '微信用户' }}</div>
                    <div class="text-xs" style="color: #555;">{{ m.member_no || `ID:${m.id}` }}</div>
                  </div>
                </div>
              </td>
              <td>
                <span :class="['badge text-xs', m.level === 1 ? 'badge-frozen' : 'badge-pending']">
                  {{ m.level === 1 ? '直推' : `${m.level}级间推` }}
                </span>
              </td>
              <td>
                <span :class="['badge text-xs', roleBadgeClass(m.role_level)]">{{ roleName(m.role_level) }}</span>
              </td>
              <td class="text-sm text-white">{{ m.order_count || 0 }}</td>
              <td class="text-xs" style="color: #555;">{{ formatDate(m.created_at) }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="flex items-center justify-between px-4 py-3 border-t" style="border-color: #1e1e1e;">
        <span class="text-sm" style="color: #555;">共 {{ total }} 位成员</span>
        <div class="flex gap-2">
          <button class="btn-ghost px-3 py-1 text-sm" :disabled="page <= 1" @click="page--; loadTeam()">上一页</button>
          <span class="text-sm px-2" style="color: #888;">{{ page }} / {{ totalPages }}</span>
          <button class="btn-ghost px-3 py-1 text-sm" :disabled="page >= totalPages" @click="page++; loadTeam()">下一页</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'dashboard' })

const authStore = useAuthStore()
const { get } = useApi()

const loading = ref(false)
const members = ref<any[]>([])
const total = ref(0)
const page = ref(1)
const limit = 20
const keyword = ref('')
const levelFilter = ref('')
const roleFilter = ref('')
const stats = ref<any>({})

const totalPages = computed(() => Math.max(1, Math.ceil(total.value / limit)))
const IconUsers = resolveComponent('IconUsers')

let searchTimer: any
function debouncedSearch() {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => { page.value = 1; loadTeam() }, 400)
}

function roleName(r: number) {
  return r === 3 ? '代理商' : r === 2 ? '团长' : r === 1 ? '会员' : '普通'
}
function roleBadgeClass(r: number) {
  return r === 3 ? 'badge-approved' : r === 2 ? 'badge-frozen' : 'badge-cancelled'
}
function formatDate(d: string) {
  return new Date(d).toLocaleDateString('zh-CN', { year: 'numeric', month: 'short', day: 'numeric' })
}

async function copyCode() {
  const code = authStore.user?.invite_code || ''
  if (navigator.clipboard) { await navigator.clipboard.writeText(code) }
  alert(`邀请码 ${code} 已复制`)
}

async function loadTeam() {
  loading.value = true
  try {
    const res = await get<any>('/api/distribution/team', {
      page: page.value, limit,
      keyword: keyword.value || undefined,
      level: levelFilter.value || undefined,
      role_level: roleFilter.value || undefined
    })
    members.value = res?.list || []
    total.value = res?.pagination?.total || 0
  } catch { members.value = [] }
  loading.value = false
}

async function loadStats() {
  try { stats.value = await get<any>('/api/distribution/stats') || {} } catch {}
}

onMounted(() => { loadStats(); loadTeam() })
</script>
