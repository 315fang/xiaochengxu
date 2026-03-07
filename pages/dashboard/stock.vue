<template>
  <div>
    <!-- 库存概览 -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <StatCard
        label="当前云仓库存"
        :value="workbench.stock_count || 0"
        suffix="件"
        :highlighted="true"
        :icon="IconPackage"
        iconColor="167,139,250"
        :sub="`待发货 ${workbench.pending_orders || 0} 单`"
      />
      <StatCard
        label="本月出库"
        :value="workbench.month_shipped || 0"
        suffix="件"
        :icon="IconTrendingUp"
        iconColor="74,222,128"
      />
      <StatCard
        label="累计入库"
        :value="workbench.total_stocked || 0"
        suffix="件"
        :icon="IconPackage"
        iconColor="96,165,250"
      />
    </div>

    <!-- 采购入仓 -->
    <div class="card p-6 mb-6">
      <h3 class="font-semibold text-white mb-5">申请采购入仓</h3>
      <form @submit.prevent="submitRestock" class="space-y-4">
        <div class="grid md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm mb-2" style="color: #aaa;">采购数量</label>
            <input v-model="restockForm.quantity" type="number" class="input" placeholder="请输入采购数量" min="1" />
          </div>
          <div>
            <label class="block text-sm mb-2" style="color: #aaa;">备注（选填）</label>
            <input v-model="restockForm.remark" class="input" placeholder="如：补货/活动备货" />
          </div>
        </div>
        <div v-if="restockError" class="p-3 rounded-lg text-sm" style="background: rgba(248,113,113,0.1); color: #f87171; border: 1px solid rgba(248,113,113,0.2);">
          {{ restockError }}
        </div>
        <button type="submit" class="btn-gold px-8 h-10 font-medium" :disabled="restockSubmitting">
          {{ restockSubmitting ? '提交中...' : '提交采购申请' }}
        </button>
      </form>
    </div>

    <!-- 库存变动日志 -->
    <div class="card overflow-hidden">
      <div class="flex items-center justify-between p-5 border-b" style="border-color: #1e1e1e;">
        <h3 class="font-semibold text-white">库存变动日志</h3>
        <select v-model="logType" class="input w-auto text-sm py-1.5" @change="loadLogs()">
          <option value="">全部类型</option>
          <option value="in">入库</option>
          <option value="out">出库</option>
          <option value="adjust">调整</option>
        </select>
      </div>

      <div v-if="logsLoading" class="p-8 text-center text-sm" style="color: #555;">加载中...</div>
      <div v-else-if="logs.length === 0" class="p-8 text-center text-sm" style="color: #555;">暂无库存记录</div>
      <div v-else class="overflow-x-auto">
        <table class="table-base">
          <thead>
            <tr>
              <th>时间</th>
              <th>变动类型</th>
              <th>数量</th>
              <th>变动后库存</th>
              <th>关联订单</th>
              <th>备注</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="log in logs" :key="log.id">
              <td class="text-xs" style="color: #888;">{{ formatDate(log.created_at) }}</td>
              <td>
                <span :class="['badge text-xs', logTypeClass(log.type)]">{{ logTypeText(log.type) }}</span>
              </td>
              <td>
                <span :class="log.change > 0 ? 'text-green-400' : 'text-red-400'" class="font-medium">
                  {{ log.change > 0 ? '+' : '' }}{{ log.change }}
                </span>
              </td>
              <td class="text-sm text-white font-medium">{{ log.stock_after }}</td>
              <td class="font-mono text-xs" style="color: #888;">{{ log.order_id || '-' }}</td>
              <td class="text-xs max-w-xs truncate" style="color: #555;">{{ log.remark || '-' }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="flex items-center justify-between px-4 py-3 border-t" style="border-color: #1e1e1e;">
        <span class="text-sm" style="color: #555;">共 {{ logsTotal }} 条</span>
        <div class="flex gap-2">
          <button class="btn-ghost px-3 py-1 text-sm" :disabled="logsPage <= 1" @click="logsPage--; loadLogs()">上一页</button>
          <span class="text-sm px-2" style="color: #888;">{{ logsPage }} / {{ logsTotalPages }}</span>
          <button class="btn-ghost px-3 py-1 text-sm" :disabled="logsPage >= logsTotalPages" @click="logsPage++; loadLogs()">下一页</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'dashboard' })

const { get, post } = useApi()

const workbench = ref<any>({})
const logs = ref<any[]>([])
const logsLoading = ref(false)
const logsTotal = ref(0)
const logsPage = ref(1)
const logsLimit = 20
const logType = ref('')
const logsTotalPages = computed(() => Math.max(1, Math.ceil(logsTotal.value / logsLimit)))

const restockForm = ref({ quantity: '', remark: '' })
const restockSubmitting = ref(false)
const restockError = ref('')

const IconPackage = resolveComponent('IconPackage')
const IconTrendingUp = resolveComponent('IconTrendingUp')

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}
function logTypeText(t: string) {
  return t === 'in' ? '入库' : t === 'out' ? '出库' : t === 'adjust' ? '调整' : t
}
function logTypeClass(t: string) {
  return t === 'in' ? 'badge-settled' : t === 'out' ? 'badge-pending' : 'badge-frozen'
}

async function submitRestock() {
  restockError.value = ''
  const qty = parseInt(restockForm.value.quantity)
  if (!qty || qty < 1) { restockError.value = '请输入有效采购数量'; return }
  restockSubmitting.value = true
  try {
    await post('/api/agent/restock', { quantity: qty, remark: restockForm.value.remark })
    restockForm.value = { quantity: '', remark: '' }
    await loadWorkbench()
    await loadLogs()
    alert('采购申请已提交，请等待平台处理')
  } catch (e: any) {
    restockError.value = e.message || '提交失败'
  }
  restockSubmitting.value = false
}

async function loadWorkbench() {
  try {
    const res = await get<any>('/api/agent/workbench')
    workbench.value = (res as any)?.workbench || res || {}
  } catch {}
}

async function loadLogs() {
  logsLoading.value = true
  try {
    const res = await get<any>('/api/agent/stock-logs', {
      page: logsPage.value, limit: logsLimit,
      type: logType.value || undefined
    })
    logs.value = res?.list || []
    logsTotal.value = res?.pagination?.total || 0
  } catch { logs.value = [] }
  logsLoading.value = false
}

onMounted(() => { loadWorkbench(); loadLogs() })
</script>
