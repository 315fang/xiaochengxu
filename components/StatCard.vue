<template>
  <div class="card p-5 hover:border-opacity-60 transition-all duration-200"
       :class="highlighted ? 'border-gold-glow' : ''">
    <div class="flex items-start justify-between mb-3">
      <div class="text-sm font-medium" style="color: #888;">{{ label }}</div>
      <div v-if="icon" class="w-9 h-9 rounded-lg flex items-center justify-center"
           :style="{ background: `rgba(${iconColor},0.1)` }">
        <component :is="icon" class="w-5 h-5" :style="{ color: `rgb(${iconColor})` }" />
      </div>
    </div>
    <div class="flex items-end gap-2">
      <span class="text-2xl font-bold text-white">
        <span v-if="prefix" class="text-base font-medium" style="color: #888;">{{ prefix }}</span>
        {{ displayValue }}
      </span>
      <span v-if="suffix" class="text-sm mb-0.5" style="color: #888;">{{ suffix }}</span>
    </div>
    <div v-if="sub" class="mt-2 text-xs" style="color: #555;">{{ sub }}</div>
    <div v-if="progress !== undefined" class="mt-3">
      <div class="flex justify-between text-xs mb-1" style="color: #555;">
        <span>{{ progressLabel }}</span>
        <span>{{ Math.round(progress) }}%</span>
      </div>
      <div class="h-1.5 rounded-full overflow-hidden" style="background: #2a2a2a;">
        <div class="h-full rounded-full transition-all duration-700"
             style="background: linear-gradient(90deg, #C6A16E, #e8c99a);"
             :style="{ width: `${Math.min(progress, 100)}%` }" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  label: string
  value: number | string
  prefix?: string
  suffix?: string
  sub?: string
  icon?: any
  iconColor?: string
  highlighted?: boolean
  progress?: number
  progressLabel?: string
}>()

const displayValue = computed(() => {
  if (typeof props.value === 'number') {
    return props.value.toLocaleString('zh-CN', { minimumFractionDigits: 0 })
  }
  return props.value
})
</script>
