import type { AchievementDef, CardMastery, Domain, MetricKey } from '@/types'

/** 学习领域选项 */
export const DOMAINS: Domain[] = ['语言', '编程', '考证', '兴趣', '学科', '职场技能', '其他']

/** 卡片掌握程度选项 */
export const CARD_MASTERY_LEVELS: CardMastery[] = ['生疏', '熟悉', '精通']

/** 掌握程度 → 颜色映射（Element Plus tag type） */
export const CARD_MASTERY_TAG_TYPE: Record<CardMastery, 'danger' | 'warning' | 'success'> = {
  生疏: 'danger',
  熟悉: 'warning',
  精通: 'success',
}

/** localStorage 键名集中管理 */
export const STORAGE_KEYS = {
  plans: 'fsm:plans',
  logs: 'fsm:logs',
  cards: 'fsm:cards',
  unlocked: 'fsm:unlocked',
} as const

/** 12 种成就徽章定义 */
export const ACHIEVEMENTS: AchievementDef[] = [
  { code: 'first_log', name: '初次启航', description: '记录第一条学习日志', icon: '🌱', points: 10, metric: 'logCount', threshold: 1 },
  { code: 'streak_7', name: '坚持之星', description: '连续学习达到 7 天', icon: '⭐', points: 30, metric: 'maxStreak', threshold: 7 },
  { code: 'streak_30', name: '百日坚持', description: '连续学习达到 30 天', icon: '🏆', points: 100, metric: 'maxStreak', threshold: 30 },
  { code: 'log_50', name: '复盘高手', description: '累计记录 50 条学习日志', icon: '📝', points: 40, metric: 'logCount', threshold: 50 },
  { code: 'card_20', name: '知识收藏家', description: '创建 20 张知识卡片', icon: '📚', points: 40, metric: 'cardCount', threshold: 20 },
  { code: 'card_50', name: '卡片大师', description: '创建 50 张知识卡片', icon: '🗂️', points: 80, metric: 'cardCount', threshold: 50 },
  { code: 'plan_1', name: '计划完成者', description: '完成第一个学习计划', icon: '✅', points: 50, metric: 'completedPlans', threshold: 1 },
  { code: 'plan_5', name: '计划达人', description: '累计完成 5 个学习计划', icon: '🎯', points: 120, metric: 'completedPlans', threshold: 5 },
  { code: 'hours_100', name: '学习达人', description: '累计学习达到 100 小时', icon: '📖', points: 60, metric: 'totalDuration', threshold: 100 },
  { code: 'hours_500', name: '学霸之路', description: '累计学习达到 500 小时', icon: '🎓', points: 150, metric: 'totalDuration', threshold: 500 },
  { code: 'domain_5', name: '多面手', description: '涉猎 5 个不同学习领域', icon: '🎨', points: 30, metric: 'domainCount', threshold: 5 },
  { code: 'hours_1000', name: '全能学霸', description: '累计学习达到 1000 小时', icon: '👑', points: 200, metric: 'totalDuration', threshold: 1000 },
]

/** 学习挑战（面向进度的可视化目标） */
export interface Challenge {
  key: string
  title: string
  description: string
  metric: MetricKey
  threshold: number
  unit: string
}

export const CHALLENGES: Challenge[] = [
  { key: 'ch_streak_7', title: '连续学习 7 天', description: '坚持每天学习，养成习惯', metric: 'maxStreak', threshold: 7, unit: '天' },
  { key: 'ch_hours_100', title: '累计学习 100 小时', description: '量变引起质变', metric: 'totalDuration', threshold: 100, unit: '小时' },
  { key: 'ch_plan_1', title: '完成一个计划', description: '有始有终，达成目标', metric: 'completedPlans', threshold: 1, unit: '个' },
  { key: 'ch_card_20', title: '积累 20 张卡片', description: '把知识装进口袋', metric: 'cardCount', threshold: 20, unit: '张' },
]
