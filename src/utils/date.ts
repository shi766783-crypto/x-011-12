// 日期相关的纯函数工具：统一以 YYYY-MM-DD 字符串为日期载体

const DAY_MS = 24 * 60 * 60 * 1000

/** Date → YYYY-MM-DD（本地时区） */
export function toDateKey(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

/** 今日 YYYY-MM-DD */
export function today(): string {
  return toDateKey(new Date())
}

/** YYYY-MM-DD → Date（本地时区零点） */
export function parseDateKey(key: string): Date {
  const [y, m, d] = key.split('-').map(Number)
  return new Date(y, m - 1, d)
}

/** 两个日期之间相差的天数（b - a，按自然日） */
export function daysBetween(a: string, b: string): number {
  return Math.round((parseDateKey(b).getTime() - parseDateKey(a).getTime()) / DAY_MS)
}

/** 在日期基础上加减 n 天 */
export function addDays(key: string, n: number): string {
  return toDateKey(new Date(parseDateKey(key).getTime() + n * DAY_MS))
}

/** 从今天往前推 n 天的日期键（含今天），共 n 项 */
export function lastNDateKeys(n: number): string[] {
  const keys: string[] = []
  for (let i = n - 1; i >= 0; i--) {
    keys.push(addDays(today(), -i))
  }
  return keys
}

/** 日期对应的月份键 YYYY-MM */
export function monthOf(key: string): string {
  return key.slice(0, 7)
}

/** 短标签，如 "9/15" */
export function shortLabel(key: string): string {
  const [, m, d] = key.split('-')
  return `${Number(m)}/${Number(d)}`
}
