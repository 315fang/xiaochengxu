<template>
  <div class="max-w-2xl">
    <!-- 余额卡 -->
    <div class="card p-6 mb-6 border-gold-glow">
      <div class="flex items-center justify-between mb-2">
        <span class="text-sm" style="color: #888;">可用余额</span>
        <span class="badge badge-settled text-xs">可提现</span>
      </div>
      <div class="text-4xl font-bold text-gold mb-1">¥{{ formatMoney(wallet.balance) }}</div>
      <div class="text-sm" style="color: #555;">冻结中：¥{{ formatMoney(wallet.frozen_amount) }}</div>
    </div>

    <!-- 提现表单 -->
    <div class="card p-6 mb-6">
      <h3 class="font-semibold text-white mb-5">申请提现</h3>
      <form @submit.prevent="submitWithdraw" class="space-y-4">
        <div>
          <label class="block text-sm mb-2" style="color: #aaa;">提现金额</label>
          <div class="relative">
            <span class="absolute left-3 top-1/2 -translate-y-1/2 text-sm" style="color: #888;">¥</span>
            <input v-model="form.amount" type="number" class="input pl-7" placeholder="请输入提现金额" step="0.01" min="1" />
          </div>
          <div class="flex gap-2 mt-2">
            <button v-for="quick in quickAmounts" :key="quick" type="button"
                    class="btn-ghost text-xs px-3 py-1 rounded border" style="border-color: #2a2a2a;"
                    @click="form.amount = String(quick)">
              ¥{{ quick }}
            </button>
            <button type="button" class="btn-ghost text-xs px-3 py-1 rounded border" style="border-color: #2a2a2a; color: #C6A16E;"
                    @click="form.amount = formatMoney(wallet.balance)">
              全部
            </button>
          </div>
        </div>

        <div>
          <label class="block text-sm mb-2" style="color: #aaa;">提现方式</label>
          <div class="flex gap-3">
            <label v-for="m in methods" :key="m.value"
                   :class="['flex-1 flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all',
                            form.method === m.value ? 'border-gold-glow' : '']"
                   :style="{ background: form.method === m.value ? 'rgba(198,161,110,0.05)' : '#1a1a1a', borderColor: form.method === m.value ? '#C6A16E' : '#2a2a2a' }">
              <input type="radio" v-model="form.method" :value="m.value" class="hidden" />
              <span class="text-lg">{{ m.icon }}</span>
              <span class="text-sm font-medium text-white">{{ m.label }}</span>
            </label>
          </div>
        </div>

        <div v-if="form.method === 'bank'" class="space-y-3">
          <div>
            <label class="block text-sm mb-2" style="color: #aaa;">银行名称</label>
            <input v-model="form.bank_name" class="input" placeholder="如：招商银行" />
          </div>
          <div>
            <label class="block text-sm mb-2" style="color: #aaa;">账户名</label>
            <input v-model="form.account_name" class="input" placeholder="账户持有人姓名" />
          </div>
          <div>
            <label class="block text-sm mb-2" style="color: #aaa;">银行卡号</label>
            <input v-model="form.account_no" class="input font-mono" placeholder="银行卡号" />
          </div>
        </div>

        <div v-if="errorMsg" class="p-3 rounded-lg text-sm" style="background: rgba(248,113,113,0.1); color: #f87171; border: 1px solid rgba(248,113,113,0.2);">
          {{ errorMsg }}
        </div>

        <button type="submit" class="btn-gold w-full h-11 font-medium" :disabled="submitting">
          {{ submitting ? '提交中...' : '提交提现申请' }}
        </button>
      </form>
    </div>

    <!-- 提现记录 -->
    <div class="card">
      <div class="p-5 border-b" style="border-color: #1e1e1e;">
        <h3 class="font-semibold text-white">提现记录</h3>
      </div>
      <div v-if="historyLoading" class="p-8 text-center text-sm" style="color: #555;">加载中...</div>
      <div v-else-if="history.length === 0" class="p-8 text-center text-sm" style="color: #555;">暂无提现记录</div>
      <div v-else class="overflow-x-auto">
        <table class="table-base">
          <thead>
            <tr>
              <th>提现单号</th>
              <th>金额</th>
              <th>方式</th>
              <th>状态</th>
              <th>申请时间</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in history" :key="item.id">
              <td class="font-mono text-xs" style="color: #888;">{{ item.withdrawal_no }}</td>
              <td class="font-semibold text-gold">¥{{ item.amount }}</td>
              <td class="text-sm" style="color: #aaa;">{{ methodText(item.method) }}</td>
              <td>
                <span :class="['badge text-xs', withdrawStatusClass(item.status)]">
                  {{ withdrawStatusText(item.status) }}
                </span>
              </td>
              <td class="text-xs" style="color: #555;">{{ formatDate(item.created_at) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="flex items-center justify-between px-4 py-3 border-t" style="border-color: #1e1e1e;">
        <span class="text-sm" style="color: #555;">共 {{ historyTotal }} 条</span>
        <div class="flex gap-2">
          <button class="btn-ghost px-3 py-1 text-sm" :disabled="hPage <= 1" @click="hPage--; loadHistory()">上一页</button>
          <button class="btn-ghost px-3 py-1 text-sm" :disabled="hPage >= historyTotalPages" @click="hPage++; loadHistory()">下一页</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'dashboard' })

const { get, post } = useApi()

const wallet = ref({ balance: 0, frozen_amount: 0 })
const form = ref({ amount: '', method: 'wechat', bank_name: '', account_name: '', account_no: '' })
const submitting = ref(false)
const errorMsg = ref('')

const history = ref<any[]>([])
const historyLoading = ref(false)
const historyTotal = ref(0)
const hPage = ref(1)
const historyLimit = 10
const historyTotalPages = computed(() => Math.max(1, Math.ceil(historyTotal.value / historyLimit)))

const quickAmounts = [100, 500, 1000, 3000]
const methods = [
  { value: 'wechat', label: '微信', icon: '💬' },
  { value: 'bank', label: '银行卡', icon: '🏦' },
]

function formatMoney(v: any) { return (Number(v) || 0).toFixed(2) }
function formatDate(d: string) {
  return new Date(d).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}
function methodText(m: string) {
  return m === 'wechat' ? '微信' : m === 'bank' ? '银行卡' : m
}
function withdrawStatusText(s: string) {
  const map: Record<string, string> = {
    pending: '待审核', approved: '已审批', processing: '打款中', completed: '已完成', rejected: '已拒绝', failed: '失败'
  }
  return map[s] || s
}
function withdrawStatusClass(s: string) {
  const map: Record<string, string> = {
    pending: 'badge-pending', approved: 'badge-approved', processing: 'badge-frozen',
    completed: 'badge-settled', rejected: 'badge-rejected', failed: 'badge-cancelled'
  }
  return map[s] || ''
}

async function submitWithdraw() {
  errorMsg.value = ''
  const amount = parseFloat(form.value.amount)
  if (!amount || amount < 10) { errorMsg.value = '最低提现金额为 ¥10'; return }
  if (amount > wallet.value.balance) { errorMsg.value = '提现金额超过可用余额'; return }

  submitting.value = true
  try {
    const payload: any = { amount, method: form.value.method }
    if (form.value.method === 'bank') {
      if (!form.value.bank_name || !form.value.account_name || !form.value.account_no) {
        errorMsg.value = '请填写完整的银行信息'; submitting.value = false; return
      }
      payload.bank_name = form.value.bank_name
      payload.account_name = form.value.account_name
      payload.account_no = form.value.account_no
    }
    await post('/api/wallet/withdraw', payload)
    form.value.amount = ''
    await loadWallet()
    await loadHistory()
    alert('提现申请已提交，请等待审核')
  } catch (e: any) {
    errorMsg.value = e.message || '提交失败'
  }
  submitting.value = false
}

async function loadWallet() {
  try { wallet.value = await get<any>('/api/wallet/info') || { balance: 0, frozen_amount: 0 } } catch {}
}

async function loadHistory() {
  historyLoading.value = true
  try {
    const res = await get<any>('/api/wallet/withdrawals', { page: hPage.value, limit: historyLimit })
    history.value = res?.list || []
    historyTotal.value = res?.pagination?.total || 0
  } catch { history.value = [] }
  historyLoading.value = false
}

onMounted(() => { loadWallet(); loadHistory() })
</script>
