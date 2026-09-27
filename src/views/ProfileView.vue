<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import StatCard from '@/components/StatCard.vue'
import { computePlanProgress } from '@/utils/progress'
import { useAchievementsStore } from '@/stores/achievements'
import { useLogsStore } from '@/stores/logs'
import { usePlansStore } from '@/stores/plans'
import { useStatsStore } from '@/stores/stats'

const router = useRouter()
const plansStore = usePlansStore()
const logsStore = useLogsStore()
const statsStore = useStatsStore()
const achievementsStore = useAchievementsStore()

const stats = computed(() => statsStore.stats)

const recentPlans = computed(() =>
  plansStore.plans.slice(0, 5).map((plan) => ({
    plan,
    progress: computePlanProgress(plan, logsStore.logs),
  })),
)

const recentLogs = computed(() => logsStore.logs.slice(0, 5))

const unlockedBadges = computed(() => achievementsStore.achievements.filter((a) => a.unlocked))
</script>

<template>
  <div>
    <div class="page-header">
      <h2 class="page-title">个人中心</h2>
    </div>

    <div class="card-grid">
      <StatCard label="总学习时长(时)" :value="stats.totalDuration" icon="⏱️" color="#409eff" />
      <StatCard label="连续学习天数" :value="stats.currentStreak" icon="🔥" color="#f56c6c" />
      <StatCard label="已完成计划" :value="stats.completedPlans" icon="✅" color="#67c23a" />
      <StatCard label="知识卡片" :value="stats.cardCount" icon="📚" color="#909399" />
      <StatCard label="成就积分" :value="achievementsStore.totalPoints" icon="🏅" color="#e6a23c" />
      <StatCard label="已解锁徽章" :value="`${achievementsStore.unlockedCount}/12`" icon="🎖️" color="#8e44ad" />
    </div>

    <div class="profile-grid">
      <el-card shadow="never">
        <template #header><span>我的学习计划</span></template>
        <el-empty v-if="recentPlans.length === 0" description="暂无学习计划" />
        <div v-else class="plan-mini-list">
          <div v-for="{ plan, progress } in recentPlans" :key="plan.id" class="plan-mini">
            <div class="plan-mini-head">
              <span>{{ plan.name }}</span>
              <el-tag size="small" effect="plain">{{ plan.domain }}</el-tag>
            </div>
            <el-progress :percentage="progress.percent" :stroke-width="8" />
          </div>
          <el-button text type="primary" @click="router.push('/plans')">查看全部计划 →</el-button>
        </div>
      </el-card>

      <el-card shadow="never">
        <template #header><span>学习统计</span></template>
        <div class="stat-table">
          <div class="stat-row"><span>平均每日时长</span><b>{{ stats.averageDailyDuration }} 时</b></div>
          <div class="stat-row"><span>本月学习时长</span><b>{{ stats.monthlyDuration }} 时</b></div>
          <div class="stat-row"><span>最长连续天数</span><b>{{ stats.maxStreak }} 天</b></div>
          <div class="stat-row"><span>学习日志数</span><b>{{ stats.logCount }} 条</b></div>
          <div class="stat-row"><span>涉猎领域数</span><b>{{ stats.domainCount }} 个</b></div>
          <div class="stat-row"><span>卡片掌握率</span><b>{{ stats.cardMasteryRate }}%</b></div>
        </div>
      </el-card>

      <el-card shadow="never">
        <template #header><span>最近学习日志</span></template>
        <el-empty v-if="recentLogs.length === 0" description="暂无学习日志" />
        <div v-else class="log-mini-list">
          <div v-for="log in recentLogs" :key="log.id" class="log-mini">
            <span class="log-date">{{ log.date }}</span>
            <span class="log-content">{{ log.content }}</span>
            <span class="log-duration">{{ log.duration }}h</span>
          </div>
          <el-button text type="primary" @click="router.push('/logs')">查看全部日志 →</el-button>
        </div>
      </el-card>

      <el-card shadow="never">
        <template #header><span>成就徽章</span></template>
        <el-empty v-if="unlockedBadges.length === 0" description="还没有解锁徽章，去挑战吧" />
        <div v-else class="badge-strip">
          <div v-for="b in unlockedBadges" :key="b.code" class="badge-chip" :title="b.description">
            <span class="badge-chip-icon">{{ b.icon }}</span>
            <span>{{ b.name }}</span>
          </div>
        </div>
      </el-card>
    </div>
  </div>
</template>

<style scoped>
.profile-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-top: 20px;
}

@media (max-width: 900px) {
  .profile-grid {
    grid-template-columns: 1fr;
  }
}

.plan-mini-list,
.log-mini-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.plan-mini-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 6px;
  font-size: 14px;
  color: #303133;
}

.stat-table {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.stat-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 8px;
  border-bottom: 1px dashed #ebeef5;
  font-size: 14px;
  color: #606266;
}

.stat-row b {
  color: #1f2d3d;
}

.log-mini {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 13px;
}

.log-date {
  color: #909399;
  flex-shrink: 0;
}

.log-content {
  flex: 1;
  color: #303133;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.log-duration {
  color: #409eff;
  font-weight: 600;
  flex-shrink: 0;
}

.badge-strip {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.badge-chip {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  border: 1px solid #ebeef5;
  border-radius: 20px;
  background: #f8f9fb;
  font-size: 13px;
  color: #303133;
}

.badge-chip-icon {
  font-size: 18px;
}
</style>
