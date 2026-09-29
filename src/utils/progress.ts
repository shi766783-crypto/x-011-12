import type { PlanProgress, StudyLog, StudyPlan } from '@/types'
import { daysBetween, today } from '@/utils/date'

/** el-progress 支持的状态（undefined 为默认蓝色） */
export type ProgressBarStatus = 'success' | 'exception' | 'warning' | undefined

/**
 * 落后判定缓冲（小时）：实际学时低于应完成学时时，
 * 缺口至少达到一天的每日时长才判定为“明显落后”，避免几小时的抖动造成误报。
 */
function isBehind(plan: StudyPlan, shouldHours: number, actualHours: number): boolean {
  const tolerance = Math.max(plan.dailyHours, 0)
  return shouldHours > 0 && shouldHours - actualHours >= tolerance
}

/**
 * 计算单个计划的进度（纯函数）。
 * 规则：
 * - 已过天数 = 开始日期到今天的自然日（未开始为 0）
 * - 剩余天数 = 今天到结束日期的自然日（已结束为 0）
 * - 应完成学时 = min(已过天数 × 每日时长, 总学时)
 * - 实际学时 = 该计划关联日志的时长之和
 * - 进度百分比 = min(实际 / 总 × 100, 100)，手动完成视为 100%
 * - 落后预警 = 实际学时明显低于应完成学时（缺口 >= 一天的每日时长）
 */
export function computePlanProgress(plan: StudyPlan, logs: StudyLog[]): PlanProgress {
  const todayKey = today()
  const totalDays = Math.max(daysBetween(plan.startDate, plan.endDate), 0)

  const elapsedDays = Math.max(daysBetween(plan.startDate, todayKey), 0)
  const remainingDays = Math.max(daysBetween(todayKey, plan.endDate), 0)

  const shouldHours = Math.min(elapsedDays * plan.dailyHours, plan.totalHours)
  const rawActualHours = logs
    .filter((l) => l.planId === plan.id)
    .reduce((sum, l) => sum + l.duration, 0)

  const manuallyCompleted = Boolean(plan.completedAt)
  const percent = manuallyCompleted ? 100 : Math.min((rawActualHours / plan.totalHours) * 100, 100)

  let status: PlanProgress['status']
  if (manuallyCompleted || percent >= 100) {
    status = '已完成'
  } else if (todayKey < plan.startDate) {
    status = '未开始'
  } else if (todayKey > plan.endDate) {
    status = '已逾期'
  } else {
    status = '进行中'
  }

  const actualHours = Math.round(rawActualHours * 10) / 10
  // 已完成（含手动标记）不再预警；其余状态只要跟不上日期节奏即提示落后
  const behindSchedule = status !== '已完成' && isBehind(plan, shouldHours, rawActualHours)
  const behindHours = behindSchedule ? Math.round((shouldHours - rawActualHours) * 10) / 10 : 0

  return {
    elapsedDays,
    remainingDays,
    totalDays,
    shouldHours,
    actualHours,
    percent: Math.round(percent),
    status,
    behindSchedule,
    behindHours,
  }
}

/**
 * 按计划进度推导进度条颜色状态，供各页面统一使用：
 * 已逾期/落后 = 红/橙警示色，已完成 = 绿色，正常进行中 = 默认蓝色。
 */
export function planProgressBarStatus(progress: PlanProgress): ProgressBarStatus {
  if (progress.status === '已完成') return 'success'
  if (progress.status === '已逾期') return 'exception'
  if (progress.behindSchedule) return 'warning'
  return undefined
}

/** 计划是否完成（供排行榜/成就判定复用） */
export function isPlanCompleted(plan: StudyPlan, logs: StudyLog[]): boolean {
  return computePlanProgress(plan, logs).status === '已完成'
}
