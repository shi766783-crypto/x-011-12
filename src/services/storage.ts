// localStorage 持久化封装：隔离所有对浏览器存储的直接访问
// 上层（store）只依赖此服务，便于未来替换为 IndexedDB 或后端 API

export function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw === null ? fallback : (JSON.parse(raw) as T)
  } catch {
    return fallback
  }
}

export function write<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // 存储满或隐私模式下静默失败，不阻塞应用
  }
}

export function remove(key: string): void {
  localStorage.removeItem(key)
}
