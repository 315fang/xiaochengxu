<template>
  <div style="background: #0f0f0f; min-height: 100vh;">
    <!-- 顶部导航 -->
    <nav class="border-b px-6 h-16 flex items-center justify-between" style="border-color: #1a1a1a;">
      <NuxtLink to="/" class="flex items-center gap-3">
        <div class="w-8 h-8 rounded-lg flex items-center justify-center"
             style="background: linear-gradient(135deg, #C6A16E, #8B6914);">
          <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
        </div>
        <span class="font-semibold text-white">代理商中心</span>
      </NuxtLink>
      <NuxtLink to="/login" class="btn-outline text-sm">已有账号，登录</NuxtLink>
    </nav>

    <div class="max-w-4xl mx-auto px-6 py-16">
      <!-- 标题 -->
      <div class="text-center mb-16">
        <div class="inline-flex items-center gap-2 px-4 py-2 rounded-full border text-xs font-medium mb-6"
             style="border-color: rgba(198,161,110,0.3); color: #C6A16E; background: rgba(198,161,110,0.05);">
          正在招募中
        </div>
        <h1 class="text-4xl md:text-5xl font-bold text-white mb-4">加入代理体系</h1>
        <p class="text-lg max-w-xl mx-auto" style="color: #888;">
          选择适合你的代理级别，开始建立属于自己的收益体系
        </p>
      </div>

      <!-- 三级代理对比表 -->
      <div class="card overflow-hidden mb-12">
        <div class="p-6 border-b" style="border-color: #2a2a2a;">
          <h2 class="text-lg font-semibold text-white">三级代理权益对比</h2>
          <p class="text-sm mt-1" style="color: #888;">所有数字均为参考值，以实际签约协议为准</p>
        </div>
        <div class="overflow-x-auto">
          <table class="table-base">
            <thead>
              <tr>
                <th style="width: 200px;">权益项目</th>
                <th v-for="level in levels" :key="level.name" class="text-center">
                  <div :class="['inline-flex flex-col items-center gap-1 px-4 py-2 rounded-lg', level.featured ? 'border-gold-glow' : '']"
                       :style="level.featured ? 'background: rgba(198,161,110,0.08)' : ''">
                    <span :style="{ color: level.featured ? '#C6A16E' : '#e5e5e5' }" class="font-semibold">{{ level.name }}</span>
                    <span class="text-xs font-normal" style="color: #666;">{{ level.condition }}</span>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in comparisonRows" :key="row.label">
                <td class="font-medium" style="color: #aaa;">{{ row.label }}</td>
                <td v-for="level in levels" :key="level.name" class="text-center">
                  <template v-if="typeof row.values[level.key] === 'boolean'">
                    <svg v-if="row.values[level.key]" class="w-5 h-5 mx-auto text-gold" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                    </svg>
                    <svg v-else class="w-5 h-5 mx-auto" style="color: #333;" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
                    </svg>
                  </template>
                  <span v-else :class="level.featured ? 'text-gold font-medium' : ''" style="color: #aaa;">
                    {{ row.values[level.key] }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- 加入流程 -->
      <div class="mb-16">
        <h2 class="text-2xl font-bold text-white text-center mb-10">加入流程</h2>
        <div class="grid md:grid-cols-4 gap-6">
          <div v-for="(step, i) in steps" :key="step.title" class="text-center">
            <div class="w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-4 text-sm font-bold"
                 style="background: rgba(198,161,110,0.1); color: #C6A16E; border: 1px solid rgba(198,161,110,0.2);">
              {{ i + 1 }}
            </div>
            <h3 class="font-semibold text-white mb-2">{{ step.title }}</h3>
            <p class="text-sm" style="color: #888;">{{ step.desc }}</p>
          </div>
        </div>
      </div>

      <!-- 联系申请 -->
      <div class="card p-8 text-center border-gold-glow">
        <h2 class="text-2xl font-bold text-white mb-3">准备好了？</h2>
        <p class="mb-6" style="color: #888;">
          联系我们的招商团队，获取专属代理资格和培训材料
        </p>
        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <a href="tel:400-xxx-xxxx" class="btn-gold px-8 py-3 font-medium">
            <svg class="w-4 h-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.948V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            电话咨询
          </a>
          <NuxtLink to="/login" class="btn-outline px-8 py-3 font-medium">
            已有账号，直接登录
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'blank' })

const levels = [
  { name: '三级代理', key: 'l3', condition: '入门起步', featured: false },
  { name: '二级代理', key: 'l2', condition: '团队 5 人+', featured: true },
  { name: '一级代理', key: 'l1', condition: '团队 20 人+', featured: false }
]

const comparisonRows = [
  { label: '直推佣金比例', values: { l3: '5%~8%', l2: '8%~12%', l1: '12%~15%' } },
  { label: '间推团队佣金', values: { l3: false, l2: '2%~4%', l1: '4%~6%' } },
  { label: '级差利润', values: { l3: '基础级差', l2: '二级级差', l1: '顶级级差' } },
  { label: '发货方式', values: { l3: '委托平台', l2: '自发/委托', l1: '自发/委托' } },
  { label: '云仓库存', values: { l3: false, l2: true, l1: true } },
  { label: '专属培训', values: { l3: true, l2: true, l1: true } },
  { label: '运营支持', values: { l3: '基础', l2: '专属', l1: '一对一' } },
  { label: '区域保护', values: { l3: false, l2: false, l1: true } },
  { label: '品牌共创', values: { l3: false, l2: false, l1: true } }
]

const steps = [
  { title: '联系招商', desc: '电话或微信联系招商团队，了解代理条件' },
  { title: '签署协议', desc: '确认合作协议，明确代理级别和区域' },
  { title: '开通账号', desc: '平台为您开通专属管理账号和工具' },
  { title: '开始经营', desc: '培训后即可开始招募团队和销售产品' }
]
</script>
