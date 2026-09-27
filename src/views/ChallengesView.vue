<script setup lang="ts">
import { computed } from 'vue'
import { CHALLENGES } from '@/constants'
import { metricValue } from '@/utils/metrics'
import { useAchievementsStore } from '@/stores/achievements'
import { useStatsStore } from '@/stores/stats'

const statsStore = useStatsStore()
const achievementsStore = useAchievementsStore()

const challenges = computed(() =>
  CHALLENGES.map((c) => {
    const value = metricValue(statsStore.stats, c.metric)
    return {
      ...c,
      value,
      percent: Math.min((value / c.threshold) * 100, 100),
      done: value >= c.threshold,
    }
  }),
)
</script>

<template>
  <div>
    <div class="page-header">
      <h2 class="page-title">学习挑战</h2>
      <el-tag type="warning" size="large">
        总积分 {{ achievementsStore.totalPoints }} · 已解锁 {{ achievementsStore.unlockedCount }}/{{ achievementsStore.achievements.length }}
      </el-tag>
    </div>

    <el-card shadow="never" class="section-card">
      <template #header><span>挑战目标</span></template>
      <div class="challenge-list">
        <div v-for="c in challenges" :key="c.key" class="challenge-item">
          <div class="challenge-info">
            <div class="challenge-title">
              {{ c.title }}
              <el-tag v-if="c.done" type="success" size="small">已达成</el-tag>
            </div>
            <div class="challenge-desc">{{ c.description }}</div>
          </div>
          <div class="challenge-progress">
            <el-progress :percentage="c.percent" :stroke-width="10" :status="c.done ? 'success' : undefined" />
            <span class="challenge-value">{{ c.value }} / {{ c.threshold }} {{ c.unit }}</span>
          </div>
        </div>
      </div>
    </el-card>

    <el-card shadow="never" class="section-card">
      <template #header><span>成就徽章</span></template>
      <div class="badge-grid">
        <div v-for="a in achievementsStore.achievements" :key="a.code" class="badge" :class="{ locked: !a.unlocked }">
          <div class="badge-icon">{{ a.unlocked ? a.icon : '🔒' }}</div>
          <div class="badge-name">{{ a.name }}</div>
          <div class="badge-desc">{{ a.description }}</div>
          <div class="badge-points">{{ a.points }} 积分</div>
          <el-progress v-if="!a.unlocked" :percentage="a.percent" :stroke-width="6" :show-text="false" />
        </div>
      </div>
    </el-card>
  </div>
</template>

<style scoped>
.section-card {
  margin-bottom: 20px;
}

.challenge-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.challenge-item {
  display: flex;
  align-items: center;
  gap: 24px;
}

.challenge-info {
  flex: 1;
  min-width: 220px;
}

.challenge-title {
  font-size: 15px;
  font-weight: 600;
  color: #1f2d3d;
  display: flex;
  align-items: center;
  gap: 8px;
}

.challenge-desc {
  font-size: 13px;
  color: #909399;
  margin-top: 4px;
}

.challenge-progress {
  flex: 2;
}

.challenge-value {
  font-size: 12px;
  color: #606266;
}

.badge-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 16px;
}

.badge {
  text-align: center;
  padding: 16px;
  border: 1px solid #ebeef5;
  border-radius: 10px;
  background: #fff;
  transition: transform 0.2s;
}

.badge:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.badge.locked {
  opacity: 0.55;
}

.badge-icon {
  font-size: 36px;
  margin-bottom: 8px;
}

.badge-name {
  font-size: 14px;
  font-weight: 600;
  color: #1f2d3d;
}

.badge-desc {
  font-size: 12px;
  color: #909399;
  margin: 4px 0;
  min-height: 32px;
}

.badge-points {
  font-size: 12px;
  color: #e6a23c;
  margin-bottom: 8px;
}
</style>
