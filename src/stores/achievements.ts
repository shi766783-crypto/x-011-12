import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import type { UnlockedMap } from '@/types'
import { ACHIEVEMENTS, STORAGE_KEYS } from '@/constants'
import { read, write } from '@/services/storage'
import { today } from '@/utils/date'
import { metricValue } from '@/utils/metrics'
import { useStatsStore } from '@/stores/stats'

export interface AchievementView {
  code: string
  name: string
  description: string
  icon: string
  points: number
  value: number
  threshold: number
  percent: number
  unlocked: boolean
  unlockedAt?: string
}

/** 成就 store：基于统计指标动态判定解锁，并持久化解锁时间 */
export const useAchievementsStore = defineStore('achievements', () => {
  const unlocked = ref<UnlockedMap>(read<UnlockedMap>(STORAGE_KEYS.unlocked, {}))
  const statsStore = useStatsStore()

  const achievements = computed<AchievementView[]>(() =>
    ACHIEVEMENTS.map((def) => {
      const value = metricValue(statsStore.stats, def.metric)
      const isUnlocked = value >= def.threshold
      return {
        code: def.code,
        name: def.name,
        description: def.description,
        icon: def.icon,
        points: def.points,
        value,
        threshold: def.threshold,
        percent: Math.min((value / def.threshold) * 100, 100),
        unlocked: isUnlocked,
        unlockedAt: unlocked.value[def.code],
      }
    }),
  )

  const unlockedCount = computed(() => achievements.value.filter((a) => a.unlocked).length)
  const totalPoints = computed(() =>
    achievements.value.filter((a) => a.unlocked).reduce((sum, a) => sum + a.points, 0),
  )

  /** 扫描并记录新达成的成就（由根组件在数据变化后调用） */
  function checkAll(): void {
    let changed = false
    for (const def of ACHIEVEMENTS) {
      const value = metricValue(statsStore.stats, def.metric)
      if (value >= def.threshold && !unlocked.value[def.code]) {
        unlocked.value[def.code] = today()
        changed = true
      }
    }
    if (changed) write(STORAGE_KEYS.unlocked, unlocked.value)
  }

  return { unlocked, achievements, unlockedCount, totalPoints, checkAll }
})
