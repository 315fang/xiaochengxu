<template>
  <div>
    <!-- 佣金流程说明 -->
    <div class="card p-5 mb-6">
      <h3 class="text-sm font-medium text-white mb-3">佣金结算流程</h3>
      <div class="flex items-center gap-2 flex-wrap">
        <div v-for="(step, i) in flowSteps" :key="step.label" class="flex items-center gap-2">
          <div class="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs"
               :style="{ background: `rgba(${step.color}, 0.1)`, color: `rgb(${step.color})` }">
            <span class="w-1.5 h-1.5 rounded-full bg-current" />
            {{ step.label }}
          </div>
          <svg v-if="i < flowSteps.length - 1" class="w-4 h-4 flex-shrink-0" style="color: #333;"
               fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
      <p class="text-xs mt-3" style="color: #555;">
        订单完成后佣金冻结 → 售后期结束自动转为待审核 → 管理员审批 → T+15 自动结算到账
      </p>
    </div>

    <!-- 统计摘要 -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <div v-for="s in summary" :key="s.label" class="card p-4">
        <div class="text-xs mb-1" style="color: #888;">{{ s.label }}</div>
        <div class="text-xl font-bold text-white">
          <span class="text-sm font-normal" style="color: #888;">¥</span>{{ s.value }}
        </div>
      </div>
    </div>

    <!-- 筛选器 -->
    <div class="flex flex-wrap items-center gap-3 mb-4">
      <div class="flex rounded-lg overflow-hidden border" style="border-color: #2a2a2a;">
        <button v-for="tab in tabs" :key="tab.value"
                :class="['px-4 py-2 text-sm transition-colors', activeTab === tab.value ? 'text-gold' : 'hover:text-white']"
                :style="activeTab === tab.value ? { background: 'rgba(198,161,110,0.1)', color: '#C6A16E' } : { background: '#1a1a1a', color: '#888' }"
                @click="activeTab = tab.value; loadList()">
          {{ tab.label }}
          <span v-if="tab.count" class="ml-1 text-xs opacity-60">({{ tab.count }})</span>
        </button>
      </div>
      <select v-model="typeFilter" class="input w-auto text-sm py-2" @change="loadList()">
        <option value="">全部类型</option>
        <option value="gap">级差利润</option>
        <option value="agent_fulfillment">发货利润</option>
        <option value="direct">直推佣金</option>
        <option value="indirect">间推佣金</option>
      </select>
    </div>

    <!-- 列表 -->
    <div class="card overflow-hidden">
      <div v-if="loading" class="p-8 text-center text-sm" style="color: #555;">加载中...</div>
      <div v-else-if="list.length === 0" class="p-12 text-center text-sm" style="color: #555;">
        暂无佣金记录
      </div>
      <div v-else class="overflow-x-auto">
        <table class="table-base">
          <thead>
            <tr>
              <th>订单号</th>
              <th>类型</th>
              <th>金额</th>
              <th>状态</th>
              <th>售后期</th>
              <th>可结算时间</th>
              <th>备注</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in list" :key="item.id">
              <td class="font-mono text-xs" style="color: #888;">{{ item.order_id }}</td>
              <td><span :class="['badge text-xs', typeClass(item.type)]">{{ typeText(item.type) }}</span></td>
              <td class="font-semibold text-gold">¥{{ item.amount }}</td>
              <td><span :class="['badge text-xs', statusClass(item.status)]">{{ statusText(item.status) }}</span></td>
              <td class="text-xs" style="color: #888;">{{ formatDate(item.refund_deadline) }}</td>
              <td class="text-xs" style="color: #888;">{{ item.available_at ? formatDate(item.available_at) : '-' }}</td>
              <td class="text-xs max-w-xs truncate" style="color: #555;" :title="item.remark">{{ item.remark || '-' }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 分页 -->
      <div class="flex items-center justify-between px-4 py-3 border-t" style="border-color: #1e1e1e;">
        <span class="text-sm" style="color: #555;">共 {{ total }} 条</span>
        <div class="flex items-center gap-2">
          <button class="btn-ghost px-3 py-1 text-sm" :disabled="page <= 1" @click="prevPage">上一页</button>
          <span class="text-sm px-2" style="color: #888;">{{ page }} / {{ totalPages }}</span>
          <button class="btn-ghost px-3 py-1 text-sm" :disabled="page >= totalPages" @click="nextPage">下一页</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'dashboard' })

const { get } = useApi()

const loading = ref(false)
const list = ref<any[]>([])
const total = ref(0)
const page = ref(1)
const limit = 15
const activeTab = ref('')
const typeFilter = ref('')
const stats = ref<any>({})

const totalPages = computed(() => Math.max(1, Math.ceil(total.value / limit)))

const flowSteps = [
  { label: '冻结', color: '96,165,250' },
  { label: '待审核', color: '251,191,36' },
  { label: '已审批', color: '198,161,110' },
  { label: '已到账', color: '74,222,128' },
]

const tabs = computed(() => [
  { value: '', label: '全部' },
  { value: 'frozen', label: '冻结中' },
  { value: 'pending_approval', label: '待审核' },
  { value: 'approved', label: '已审批' },
  { value: 'settled', label: '已到账' },
  { value: 'cancelled', label: '已取消' },
])

const summary = computed(() => [
  { label: '冻结中', value: (Number(stats.value.frozen_amount) || 0).toFixed(2) },
  { label: '待审核', value: (Number(stats.value.pending_amount) || 0).toFixed(2) },
  { label: '待结算', value: (Number(stats.value.approved_amount) || 0).toFixed(2) },
  { label: '已到账（累计）', value: (Number(stats.value.settled_amount) || 0).toFixed(2) },
])

function statusText(s: string) {
  const map: Record<string, string> = { frozen: '冻结', pending_approval: '待审核', approved: '已审批', settled: '已到账', cancelled: '已取消' }
  return map[s] || s
}
function statusClass(s: string) {
  const map: Record<string, string> = { frozen: 'badge-frozen', pending_approval: 'badge-pending', approved: 'badge-approved', settled: 'badge-settled', cancelled: 'badge-cancelled' }
  return map[s] || ''
}
function typeText(t: string) {
  const map: Record<string, string> = { gap: '级差利润', agent_fulfillment: '发货利润', direct: '直推佣金', indirect: '间推佣金' }
  return map[t] || t
}
function typeClass(t: string) {
  const map: Record<string, string> = { gap: 'badge-approved', agent_fulfillment: 'badge-settled', direct: 'badge-frozen', indirect: 'badge-pending' }
  return map[t] || ''
}
function formatDate(d: string | null) {
  if (!d) return '-'
  return new Date(d).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })
}

async function loadList() {
  loading.value = true
  try {
    const res = await get<any>('/api/wallet/commissions', {
      page: page.value, limit,
      status: activeTab.value || undefined,
      type: typeFilter.value || undefined
    })
    list.value = res?.list || []
    total.value = res?.pagination?.total || 0
  } catch { list.value = [] }
  loading.value = false
}

async function loadStats() {
  try {
    stats.value = await get<any>('/api/commissions/my-stats') || {}
  } catch {}
}

function prevPage() { if (page.value > 1) { page.value--; loadList() } }
function nextPage() { if (page.value < totalPages.value) { page.value++; loadList() } }

onMounted(() => { loadStats(); loadList() })
</script>
