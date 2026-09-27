<script setup lang="ts">
import { computed } from 'vue'
import { isPlanCompleted } from '@/utils/progress'
import { useLogsStore } from '@/stores/logs'
import { usePlansStore } from '@/stores/plans'

interface RankItem {
  name: string
  value: number
  unit: string
}

const logsStore = useLogsStore()
const plansStore = usePlansStore()

const planMap = computed(() => {
  const map = new Map<string, string>()
  plansStore.plans.forEach((p) => map.set(p.id, p.domain))
  return map
})

/** 学习时长榜：按领域累计学习时长排序 */
const durationRanking = computed<RankItem[]>(() => {
  const map = new Map<string, number>()
  logsStore.logs.forEach((log) => {
    const key = planMap.value.get(log.planId ?? '') ?? '未关联'
    map.set(key, (map.get(key) ?? 0) + log.duration)
  })
  return [...map.entries()]
    .map(([name, value]) => ({ name, value: Math.round(value * 10) / 10, unit: '小时' }))
    .sort((a, b) => b.value - a.value)
})

/** 计划完成榜：按领域完成计划数排序 */
const completionRanking = computed<RankItem[]>(() => {
  const map = new Map<string, number>()
  plansStore.plans.forEach((plan) => {
    if (isPlanCompleted(plan, logsStore.logs)) {
      map.set(plan.domain, (map.get(plan.domain) ?? 0) + 1)
    }
  })
  return [...map.entries()]
    .map(([name, value]) => ({ name, value, unit: '个' }))
    .sort((a, b) => b.value - a.value)
})

const medals = ['🥇', '🥈', '🥉']
</script>

<template>
  <div>
    <div class="page-header">
      <h2 class="page-title">排行榜</h2>
    </div>

    <div class="rank-grid">
      <el-card shadow="never">
        <template #header><span>学习时长榜（按领域）</span></template>
        <el-empty v-if="durationRanking.length === 0" description="暂无学习记录" />
        <div v-else class="rank-list">
          <div v-for="(item, i) in durationRanking" :key="item.name" class="rank-item">
            <span class="rank-no">{{ medals[i] ?? `${i + 1}` }}</span>
            <span class="rank-name">{{ item.name }}</span>
            <span class="rank-value">{{ item.value }} {{ item.unit }}</span>
          </div>
        </div>
      </el-card>

      <el-card shadow="never">
        <template #header><span>计划完成榜（按领域）</span></template>
        <el-empty v-if="completionRanking.length === 0" description="暂无完成的计划" />
        <div v-else class="rank-list">
          <div v-for="(item, i) in completionRanking" :key="item.name" class="rank-item">
            <span class="rank-no">{{ medals[i] ?? `${i + 1}` }}</span>
            <span class="rank-name">{{ item.name }}</span>
            <span class="rank-value">{{ item.value }} {{ item.unit }}</span>
          </div>
        </div>
      </el-card>
    </div>
  </div>
</template>

<style scoped>
.rank-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

@media (max-width: 900px) {
  .rank-grid {
    grid-template-columns: 1fr;
  }
}

.rank-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.rank-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
  border-radius: 8px;
  background: #f8f9fb;
}

.rank-item:nth-child(1) {
  background: #fff7e6;
}

.rank-item:nth-child(2) {
  background: #f5f7fa;
}

.rank-item:nth-child(3) {
  background: #fdf1ec;
}

.rank-no {
  width: 28px;
  text-align: center;
  font-size: 18px;
  flex-shrink: 0;
}

.rank-name {
  flex: 1;
  font-size: 15px;
  font-weight: 500;
  color: #303133;
}

.rank-value {
  font-size: 14px;
  font-weight: 600;
  color: #409eff;
}
</style>
