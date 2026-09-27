<script setup lang="ts">
import { computed } from 'vue'
import StatCard from '@/components/StatCard.vue'
import TrendChart from '@/components/TrendChart.vue'
import { useStatsStore } from '@/stores/stats'

const statsStore = useStatsStore()
const stats = computed(() => statsStore.stats)
</script>

<template>
  <div>
    <div class="page-header">
      <h2 class="page-title">学习看板</h2>
    </div>

    <div class="card-grid">
      <StatCard label="进行中计划" :value="stats.activePlans" icon="🎯" color="#409eff" />
      <StatCard label="已完成计划" :value="stats.completedPlans" icon="✅" color="#67c23a" />
      <StatCard label="本月学习时长(时)" :value="stats.monthlyDuration" icon="⏱️" color="#e6a23c" />
      <StatCard label="连续学习天数" :value="stats.currentStreak" icon="🔥" color="#f56c6c" />
      <StatCard label="知识卡片总数" :value="stats.cardCount" icon="📚" color="#909399" />
      <StatCard label="卡片掌握率" :value="`${stats.cardMasteryRate}%`" icon="🧠" color="#8e44ad" />
    </div>

    <el-card class="chart-card" shadow="never">
      <template #header>
        <span>近 30 天学习时长趋势</span>
      </template>
      <TrendChart :data="stats.trend" />
    </el-card>
  </div>
</template>

<style scoped>
.chart-card {
  margin-top: 20px;
}
</style>
