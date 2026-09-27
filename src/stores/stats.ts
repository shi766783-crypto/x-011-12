import { defineStore } from 'pinia'
import { computed } from 'vue'
import type { StudyStats } from '@/types'
import { computeStats } from '@/utils/statistics'
import { useCardsStore } from '@/stores/cards'
import { useLogsStore } from '@/stores/logs'
import { usePlansStore } from '@/stores/plans'

/** 聚合统计 store：只读地组合三个实体 store，产出全局学习统计 */
export const useStatsStore = defineStore('stats', () => {
  const plansStore = usePlansStore()
  const logsStore = useLogsStore()
  const cardsStore = useCardsStore()

  const stats = computed<StudyStats>(() =>
    computeStats(plansStore.plans, logsStore.logs, cardsStore.cards),
  )

  return { stats }
})
