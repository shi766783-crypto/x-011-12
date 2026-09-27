import type { MetricKey, StudyStats } from '@/types'

/** 将统计指标键映射为具体数值（成就/挑战共用） */
export function metricValue(stats: StudyStats, metric: MetricKey): number {
  switch (metric) {
    case 'logCount':
      return stats.logCount
    case 'maxStreak':
      return stats.maxStreak
    case 'cardCount':
      return stats.cardCount
    case 'completedPlans':
      return stats.completedPlans
    case 'totalDuration':
      return stats.totalDuration
    case 'domainCount':
      return stats.domainCount
  }
}
