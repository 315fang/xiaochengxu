<template>
  <div style="background: #0f0f0f; color: #e5e5e5; min-height: 100vh;">
    <!-- 导航栏 -->
    <nav class="fixed top-0 left-0 right-0 z-50 border-b transition-all duration-300"
         :style="{ background: scrolled ? 'rgba(15,15,15,0.95)' : 'transparent',
                   borderColor: scrolled ? '#2a2a2a' : 'transparent',
                   backdropFilter: scrolled ? 'blur(12px)' : 'none' }">
      <div class="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 rounded-lg flex items-center justify-center"
               style="background: linear-gradient(135deg, #C6A16E, #8B6914);">
            <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
          <span class="font-semibold text-white">品牌代理商中心</span>
        </div>
        <div class="flex items-center gap-4">
          <NuxtLink to="/join" class="text-sm hover:text-gold transition-colors" style="color: #888;">加入我们</NuxtLink>
          <NuxtLink to="/login" class="btn-gold px-5 py-2 text-sm">登录</NuxtLink>
        </div>
      </div>
    </nav>

    <!-- Hero 区域 -->
    <section class="relative min-h-screen flex items-center justify-center px-6 pt-16">
      <!-- 背景光晕 -->
      <div class="absolute inset-0 overflow-hidden pointer-events-none">
        <div class="absolute top-1/3 left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full opacity-[0.04]"
             style="background: radial-gradient(circle, #C6A16E, transparent);" />
        <div class="absolute top-20 right-20 w-64 h-64 rounded-full opacity-[0.03]"
             style="background: radial-gradient(circle, #C6A16E, transparent);" />
      </div>

      <div class="max-w-4xl mx-auto text-center relative">
        <div class="inline-flex items-center gap-2 px-4 py-2 rounded-full border text-xs font-medium mb-8"
             style="border-color: rgba(198,161,110,0.3); color: #C6A16E; background: rgba(198,161,110,0.05);">
          <span class="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
          正在开放代理商招募
        </div>

        <h1 class="text-5xl md:text-7xl font-bold tracking-tight mb-6">
          <span class="text-white">不只是卖货，</span><br />
          <span class="gradient-text">做自己的品牌生意</span>
        </h1>

        <p class="text-lg md:text-xl max-w-2xl mx-auto mb-12 leading-relaxed" style="color: #888;">
          加入我们的三级代理体系，从产品分销到团队管理，
          从个人创业到团队扩张，一套系统全程支撑。
        </p>

        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <NuxtLink to="/join" class="btn-gold px-8 py-3.5 text-base font-medium">
            立即加入代理体系
            <svg class="w-4 h-4 ml-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </NuxtLink>
          <NuxtLink to="/login" class="btn-outline px-8 py-3.5 text-base font-medium">
            已有账号，去登录
          </NuxtLink>
        </div>

        <!-- 滚动提示 -->
        <div class="mt-20 flex flex-col items-center gap-2 opacity-40">
          <span class="text-xs" style="color: #888;">向下了解更多</span>
          <div class="w-px h-12 bg-gradient-to-b from-transparent to-current" style="color: #C6A16E;" />
        </div>
      </div>
    </section>

    <!-- 数据亮点 -->
    <section class="py-24 px-6">
      <div class="max-w-6xl mx-auto">
        <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div v-for="stat in stats" :key="stat.label"
               class="card p-6 text-center">
            <div class="text-3xl font-bold gradient-text mb-1">{{ stat.value }}</div>
            <div class="text-sm" style="color: #888;">{{ stat.label }}</div>
          </div>
        </div>
      </div>
    </section>

    <!-- 三大核心优势 -->
    <section class="py-24 px-6">
      <div class="max-w-6xl mx-auto">
        <div class="text-center mb-16">
          <h2 class="text-3xl font-bold text-white mb-4">为什么选择我们</h2>
          <p class="text-base max-w-xl mx-auto" style="color: #888;">
            从产品到系统，从培训到售后，我们为每一位代理商提供完整的成功支撑
          </p>
        </div>

        <div class="grid md:grid-cols-3 gap-8">
          <div v-for="feat in features" :key="feat.title" class="card p-8 group hover:border-gold-glow transition-all duration-300">
            <div class="w-12 h-12 rounded-xl flex items-center justify-center mb-5"
                 style="background: rgba(198,161,110,0.1);">
              <component :is="feat.icon" class="w-6 h-6 text-gold" />
            </div>
            <h3 class="text-lg font-semibold text-white mb-3">{{ feat.title }}</h3>
            <p class="text-sm leading-relaxed" style="color: #888;">{{ feat.desc }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- 收益说明 -->
    <section class="py-24 px-6" style="background: #111;">
      <div class="max-w-4xl mx-auto text-center">
        <h2 class="text-3xl font-bold text-white mb-4">透明的收益体系</h2>
        <p class="mb-12" style="color: #888;">三级代理，多维度收益，每一分钱都清晰可查</p>

        <div class="grid md:grid-cols-3 gap-6">
          <div v-for="level in commissionLevels" :key="level.name"
               :class="['card p-8 transition-all duration-300', level.featured ? 'border-gold-glow' : '']">
            <div v-if="level.featured" class="badge badge-approved mb-3">推荐</div>
            <h3 class="text-xl font-bold mb-1" :style="{ color: level.featured ? '#C6A16E' : '#e5e5e5' }">
              {{ level.name }}
            </h3>
            <p class="text-sm mb-6" style="color: #888;">{{ level.subtitle }}</p>
            <div class="space-y-3">
              <div v-for="item in level.perks" :key="item" class="flex items-start gap-2 text-sm text-left">
                <svg class="w-4 h-4 mt-0.5 flex-shrink-0 text-gold" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                </svg>
                <span style="color: #aaa;">{{ item }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA -->
    <section class="py-32 px-6 text-center">
      <div class="max-w-2xl mx-auto">
        <h2 class="text-4xl font-bold text-white mb-6">准备好开始了吗？</h2>
        <p class="text-lg mb-10" style="color: #888;">加入数百位代理商的行列，用一套系统管理你的生意</p>
        <NuxtLink to="/join" class="btn-gold px-10 py-4 text-lg font-medium">
          立即申请成为代理商
        </NuxtLink>
      </div>
    </section>

    <!-- 底部 -->
    <footer class="border-t py-8 px-6 text-center text-sm" style="border-color: #1a1a1a; color: #444;">
      © {{ new Date().getFullYear() }} 品牌代理商中心 · All rights reserved
    </footer>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'blank' })

const scrolled = ref(false)
onMounted(() => {
  window.addEventListener('scroll', () => { scrolled.value = window.scrollY > 20 })
})

const stats = [
  { value: '1000+', label: '合作代理商' },
  { value: '98%', label: '代理商满意度' },
  { value: '15天', label: '最快回款周期' },
  { value: '3级', label: '收益层级' }
]

const features = [
  {
    title: '专属管理后台',
    desc: '实时查看订单、佣金、库存、团队数据，一个界面掌控全局，随时随地管理你的生意。',
    icon: resolveComponent('IconMonitor')
  },
  {
    title: '云仓发货系统',
    desc: '代理商可选择自发货或委托平台发货，灵活的履约方式让你专注于销售而非物流。',
    icon: resolveComponent('IconPackage')
  },
  {
    title: '多级佣金体系',
    desc: '直推、间推、级差多维度结算，每一笔收益清晰记录，T+15 自动到账，安全透明。',
    icon: resolveComponent('IconTrendingUp')
  }
]

const commissionLevels = [
  {
    name: '三级代理',
    subtitle: '入门级，从零开始',
    featured: false,
    perks: ['直推订单佣金', '发货利润分成', '团队推广奖励', '专属培训资料']
  },
  {
    name: '二级代理',
    subtitle: '团队扩张，收益倍增',
    featured: true,
    perks: ['所有三级代理权益', '间推团队佣金', '云仓优先补货', '专属运营支持', '活动资源优先申请']
  },
  {
    name: '一级代理',
    subtitle: '顶级合伙人',
    featured: false,
    perks: ['所有二级代理权益', '最高级差比例', '区域保护政策', '品牌共创资格', '年度分红机制']
  }
]
</script>
