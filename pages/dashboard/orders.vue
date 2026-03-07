<template>
  <div>
    <!-- 状态 Tab -->
    <div class="flex flex-wrap gap-2 mb-6">
      <button v-for="tab in tabs" :key="tab.value"
              :class="['px-4 py-2 rounded-lg text-sm transition-colors border',
                       activeTab === tab.value ? 'text-gold' : 'hover:text-white']"
              :style="activeTab === tab.value
                ? { background: 'rgba(198,161,110,0.1)', borderColor: '#C6A16E', color: '#C6A16E' }
                : { background: '#1a1a1a', borderColor: '#2a2a2a', color: '#888' }"
              @click="activeTab = tab.value; page = 1; loadOrders()">
        {{ tab.label }}
      </button>
    </div>

    <!-- 订单列表 -->
    <div class="card overflow-hidden">
      <div v-if="loading" class="p-8 text-center text-sm" style="color: #555;">加载中...</div>
      <div v-else-if="orders.length === 0" class="p-12 text-center text-sm" style="color: #555;">
        暂无{{ activeTab ? statusText(activeTab) : '' }}订单
      </div>
      <div v-else class="space-y-0 divide-y" style="border-color: #1e1e1e;">
        <div v-for="order in orders" :key="order.id" class="p-5 hover:bg-white/[0.02] transition-colors">
          <div class="flex items-start justify-between gap-4">
            <!-- 商品信息 -->
            <div class="flex items-start gap-4 flex-1 min-w-0">
              <div class="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0" style="background: #2a2a2a;">
                <img v-if="getProductImage(order)" :src="getProductImage(order)" class="w-full h-full object-cover" />
                <div v-else class="w-full h-full flex items-center justify-center text-xs" style="color: #555;">无图</div>
              </div>
              <div class="flex-1 min-w-0">
                <div class="text-sm font-medium text-white truncate">{{ order.product?.name || '商品已下架' }}</div>
                <div class="text-xs mt-0.5 font-mono" style="color: #555;">{{ order.order_no }}</div>
                <div class="flex items-center gap-3 mt-2">
                  <span class="text-sm font-bold text-gold">¥{{ order.actual_price }}</span>
                  <span class="text-xs" style="color: #888;">× {{ order.quantity }}</span>
                  <span class="text-xs" style="color: #555;">{{ order.buyer?.nickname || '买家' }}</span>
                </div>
              </div>
            </div>

            <!-- 状态 + 操作 -->
            <div class="flex flex-col items-end gap-2 flex-shrink-0">
              <span :class="['badge text-xs', orderStatusClass(order.status)]">{{ statusText(order.status) }}</span>
              <div class="text-xs" style="color: #555;">{{ formatDate(order.created_at) }}</div>
            </div>
          </div>

          <!-- 收货地址 -->
          <div v-if="order.address || order.shipping_address" class="mt-3 p-2 rounded-lg text-xs" style="background: #1a1a1a; color: #888;">
            <span class="text-white">{{ getAddress(order) }}</span>
          </div>

          <!-- 物流信息 -->
          <div v-if="order.tracking_no" class="mt-2 flex items-center gap-2 text-xs" style="color: #888;">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            物流单号：<span class="font-mono text-white">{{ order.tracking_no }}</span>
          </div>
        </div>
      </div>

      <!-- 分页 -->
      <div class="flex items-center justify-between px-5 py-3 border-t" style="border-color: #1e1e1e;">
        <span class="text-sm" style="color: #555;">共 {{ total }} 单</span>
        <div class="flex gap-2">
          <button class="btn-ghost px-3 py-1 text-sm" :disabled="page <= 1" @click="page--; loadOrders()">上一页</button>
          <span class="text-sm px-2" style="color: #888;">{{ page }} / {{ totalPages }}</span>
          <button class="btn-ghost px-3 py-1 text-sm" :disabled="page >= totalPages" @click="page++; loadOrders()">下一页</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'dashboard' })

const { get } = useApi()

const loading = ref(false)
const orders = ref<any[]>([])
const total = ref(0)
const page = ref(1)
const limit = 15
const activeTab = ref('')

const totalPages = computed(() => Math.max(1, Math.ceil(total.value / limit)))

const tabs = [
  { value: '', label: '全部' },
  { value: 'paid', label: '待确认' },
  { value: 'agent_confirmed', label: '已确认' },
  { value: 'shipping_requested', label: '申请发货' },
  { value: 'shipped', label: '已发货' },
]

function statusText(s: string) {
  const map: Record<string, string> = {
    paid: '待确认', agent_confirmed: '已确认', shipping_requested: '申请发货',
    shipped: '已发货', completed: '已完成', cancelled: '已取消'
  }
  return map[s] || s
}
function orderStatusClass(s: string) {
  const map: Record<string, string> = {
    paid: 'badge-pending', agent_confirmed: 'badge-approved', shipping_requested: 'badge-frozen',
    shipped: 'badge-settled', completed: 'badge-settled', cancelled: 'badge-cancelled'
  }
  return map[s] || ''
}
function formatDate(d: string) {
  return new Date(d).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}
function getProductImage(order: any) {
  const imgs = order.product?.images
  if (!imgs) return ''
  try {
    const arr = typeof imgs === 'string' ? JSON.parse(imgs) : imgs
    return Array.isArray(arr) ? arr[0] : ''
  } catch { return '' }
}
function getAddress(order: any) {
  const addr = order.address || order.shipping_address
  if (!addr) return ''
  if (typeof addr === 'string') return addr
  return `${addr.province || ''}${addr.city || ''}${addr.district || ''} ${addr.detail || ''} ${addr.name || ''} ${addr.phone || ''}`
}

async function loadOrders() {
  loading.value = true
  try {
    const res = await get<any>('/api/agent/orders', {
      page: page.value, limit,
      status: activeTab.value || undefined
    })
    orders.value = res?.list || []
    total.value = res?.pagination?.total || 0
  } catch { orders.value = [] }
  loading.value = false
}

onMounted(loadOrders)
</script>
