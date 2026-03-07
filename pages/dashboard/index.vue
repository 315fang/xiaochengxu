<template>
  <div>
    <!-- 顶部问候 + 等级 -->
    <div class="flex items-center justify-between mb-8">
      <div>
        <h2 class="text-xl font-semibold text-white">
          你好，{{ authStore.user?.nickname || '代理商' }}
          <span class="ml-2 badge badge-approved text-xs">{{ authStore.agentLevelName }}</span>
        </h2>
        <p class="text-sm mt-1" style="color: #888;">
          {{ today }} · {{ authStore.user?.member_no ? `会员号 ${authStore.user.member_no}` : '' }}
        </p>
      </div>
      <!-- 邀请码 -->
      <div v-if="authStore.user?.invite_code" class="hidden sm:flex items-center gap-2 px-4 py-2 rounded-lg cursor-pointer hover:border-gold-glow transition-all"
           style="background: #1a1a1a; border: 1px solid #2a2a2a;"
           @click="copyInviteCode">
        <svg class="w-4 h-4 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
        </svg>
        <span class="text-sm text-gold font-mono">{{ authStore.user.invite_code }}</span>
        <span class="text-xs" style="color: #555;">点击复制</span>
      </div>
    </div>

    <!-- 四大核心数据卡 -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <StatCard
        label="可用余额"
        :value="formatMoney(wallet.balance)"
        prefix="¥"
        :highlighted="true"
        :icon="IconCoins"
        iconColor="198,161,110"
        sub="可申请提现"
      />
      <StatCard
        label="本月佣金"
        :value="formatMoney(workbench.month_commission)"
        prefix="¥"
        :icon="IconTrendingUp"
        iconColor="74,222,128"
        :sub="`累计 ¥${formatMoney(workbench.total_commission)}`"
      />
      <StatCard
        label="团队成员"
        :value="teamStats.total_members || 0"
        suffix="人"
        :icon="IconUsers"
        iconColor="96,165,250"
        :sub="`直推 ${teamStats.direct_members || 0} 人`"
      />
      <StatCard
        label="云仓库存"
        :value="workbench.stock_count || 0"
        suffix="件"
        :icon="IconPackage"
        iconColor="167,139,250"
        :sub="`待发货 ${workbench.pending_orders || 0} 单`"
      />
    </div>

    <!-- 晋升进度 -->
    <div class="card p-5 mb-8" v-if="authStore.user">
      <div class="flex items-center justify-between mb-4">
        <h3 class="font-medium text-white">晋升进度</h3>
        <span class="badge badge-approved text-xs">{{ authStore.agentLevelName }}</span>
      </div>
      <div class="flex items-center gap-6">
        <div class="flex-1">
          <div class="flex justify-between text-sm mb-2" style="color: #888;">
            <span>有效订单数</span>
            <span class="text-white font-medium">{{ authStore.user.order_count || 0 }} / {{ nextLevelTarget }} 单</span>
          </div>
          <div class="h-2 rounded-full overflow-hidden" style="background: #2a2a2a;">
            <div class="h-full rounded-full transition-all duration-700"
                 style="background: linear-gradient(90deg, #C6A16E, #e8c99a);"
                 :style="{ width: `${upgradeProgress}%` }" />
          </div>
          <p class="text-xs mt-2" style="color: #555;">
            {{ upgradeText }}
          </p>
        </div>
      </div>
    </div>

    <!-- 佣金状态统计 + 快捷操作 -->
    <div class="grid md:grid-cols-3 gap-6 mb-8">
      <!-- 佣金状态 -->
      <div class="md:col-span-2 card p-5">
        <h3 class="font-medium text-white mb-4">佣金状态</h3>
        <div class="space-y-3">
          <div v-for="item in commissionStatus" :key="item.label"
               class="flex items-center justify-between py-2.5 border-b last:border-b-0"
               style="border-color: #1e1e1e;">
            <div class="flex items-center gap-2">
              <span :class="['badge text-xs', item.badgeClass]">{{ item.statusText }}</span>
              <span class="text-sm" style="color: #888;">{{ item.label }}</span>
            </div>
            <span class="font-medium text-white">¥{{ formatMoney(item.amount) }}</span>
          </div>
        </div>
        <NuxtLink to="/dashboard/commissions"
                  class="mt-4 flex items-center gap-1 text-sm text-gold hover:underline">
          查看全部佣金明细
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </NuxtLink>
      </div>

      <!-- 快速入口 -->
      <div class="card p-5">
        <h3 class="font-medium text-white mb-4">快速操作</h3>
        <div class="space-y-2">
          <NuxtLink v-for="action in quickActions" :key="action.to" :to="action.to"
                    class="flex items-center gap-3 p-3 rounded-lg transition-colors hover:bg-white/5 group">
            <div class="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                 :style="{ background: `rgba(${action.color}, 0.1)` }">
              <component :is="action.icon" class="w-4 h-4" :style="{ color: `rgb(${action.color})` }" />
            </div>
            <span class="text-sm group-hover:text-white transition-colors" style="color: #aaa;">{{ action.label }}</span>
            <svg class="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </NuxtLink>
        </div>
      </div>
    </div>

    <!-- 最近订单 -->
    <div class="card">
      <div class="flex items-center justify-between p-5 border-b" style="border-color: #1e1e1e;">
        <h3 class="font-medium text-white">最近待处理订单</h3>
        <NuxtLink to="/dashboard/orders" class="text-sm text-gold hover:underline">全部订单</NuxtLink>
      </div>
      <div v-if="loading" class="p-8 text-center text-sm" style="color: #555;">加载中...</div>
      <div v-else-if="recentOrders.length === 0" class="p-8 text-center text-sm" style="color: #555;">
        暂无待处理订单
      </div>
      <div v-else class="overflow-x-auto">
        <table class="table-base">
          <thead>
            <tr>
              <th>订单号</th>
              <th>商品</th>
              <th>金额</th>
              <th>状态</th>
              <th>时间</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="order in recentOrders" :key="order.id">
              <td class="font-mono text-xs" style="color: #888;">{{ order.order_no }}</td>
              <td class="text-sm text-white">{{ order.product?.name || '-' }}</td>
              <td class="text-sm font-medium text-gold">¥{{ order.actual_price }}</td>
              <td>
                <span :class="['badge text-xs', orderStatusClass(order.status)]">
                  {{ orderStatusText(order.status) }}
                </span>
              </td>
              <td class="text-xs" style="color: #555;">{{ formatDate(order.created_at) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'dashboard' })

const authStore = useAuthStore()
const { get } = useApi()

const loading = ref(true)
const wallet = ref({ balance: 0 })
const workbench = ref<any>({})
const teamStats = ref<any>({})
const commissionStats = ref<any>({})
const recentOrders = ref<any[]>([])

const IconCoins = resolveComponent('IconCoins')
const IconTrendingUp = resolveComponent('IconTrendingUp')
const IconUsers = resolveComponent('IconUsers')
const IconPackage = resolveComponent('IconPackage')

const today = computed(() => {
  return new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })
})

const upgradeProgress = computed(() => {
  const current = authStore.user?.order_count || 0
  const target = nextLevelTarget.value
  return Math.min(100, Math.round((current / target) * 100))
})

const nextLevelTarget = computed(() => {
  const lvl = authStore.agentLevel
  if (lvl === 3) return 10
  if (lvl === 2) return 30
  return Infinity
})

const upgradeText = computed(() => {
  if (authStore.agentLevel === 1) return '已达到最高代理级别'
  const remain = Math.max(0, nextLevelTarget.value - (authStore.user?.order_count || 0))
  const nextName = authStore.agentLevel === 3 ? '二级代理' : '一级代理'
  return remain > 0 ? `还需 ${remain} 单有效订单晋升${nextName}` : '已满足晋升条件，等待审核'
})

const commissionStatus = computed(() => [
  { label: '冻结中（售后期内）', statusText: '冻结', badgeClass: 'badge-frozen', amount: commissionStats.value.frozen_amount || 0 },
  { label: '待管理员审批', statusText: '待审核', badgeClass: 'badge-pending', amount: commissionStats.value.pending_amount || 0 },
  { label: '审批通过，待结算', statusText: '待结算', badgeClass: 'badge-approved', amount: commissionStats.value.approved_amount || 0 },
  { label: '已结算到账', statusText: '已到账', badgeClass: 'badge-settled', amount: commissionStats.value.settled_amount || 0 },
])

const quickActions = [
  { to: '/dashboard/withdraw', label: '申请提现', icon: resolveComponent('IconArrowUpCircle'), color: '198,161,110' },
  { to: '/dashboard/orders', label: '处理订单', icon: resolveComponent('IconShoppingBag'), color: '96,165,250' },
  { to: '/dashboard/stock', label: '采购入仓', icon: resolveComponent('IconPackage'), color: '167,139,250' },
  { to: '/dashboard/team', label: '邀请成员', icon: resolveComponent('IconUsers'), color: '74,222,128' },
]

function formatMoney(v: any) { return (Number(v) || 0).toFixed(2) }
function formatDate(d: string) {
  return new Date(d).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

function orderStatusText(s: string) {
  const map: Record<string, string> = {
    paid: '待确认', agent_confirmed: '已确认', shipping_requested: '申请发货', shipped: '已发货'
  }
  return map[s] || s
}
function orderStatusClass(s: string) {
  const map: Record<string, string> = {
    paid: 'badge-pending', agent_confirmed: 'badge-approved',
    shipping_requested: 'badge-frozen', shipped: 'badge-settled'
  }
  return map[s] || ''
}

async function loadData() {
  loading.value = true
  const [walletRes, wbRes, teamRes, commRes, ordersRes] = await Promise.allSettled([
    get('/api/wallet/info'),
    get('/api/agent/workbench'),
    get('/api/distribution/stats'),
    get('/api/commissions/my-stats'),
    get('/api/agent/orders', { page: 1, limit: 5 }),
  ])

  if (walletRes.status === 'fulfilled') wallet.value = walletRes.value as any
  if (wbRes.status === 'fulfilled') {
    workbench.value = (wbRes.value as any)?.workbench || wbRes.value
    // 更新余额
    const wb = workbench.value
    if (wb?.balance !== undefined) authStore.updateUser({ balance: wb.balance })
  }
  if (teamRes.status === 'fulfilled') teamStats.value = teamRes.value as any
  if (commRes.status === 'fulfilled') commissionStats.value = commRes.value as any
  if (ordersRes.status === 'fulfilled') {
    recentOrders.value = ((ordersRes.value as any)?.list || []).slice(0, 5)
  }
  loading.value = false
}

onMounted(loadData)
</script>
