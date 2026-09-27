<script setup lang="ts">
defineProps<{
  label: string
  value: string | number
  icon: string
  color?: string
}>()
</script>

<template>
  <el-card class="stat-card" shadow="hover">
    <div class="stat-icon" :style="{ background: `${color ?? '#409eff'}1a`, color: color ?? '#409eff' }">
      {{ icon }}
    </div>
    <div class="stat-body">
      <div class="stat-value">{{ value }}</div>
      <div class="stat-label">{{ label }}</div>
    </div>
  </el-card>
</template>

<style scoped>
.stat-card :deep(.el-card__body) {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 18px;
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  flex-shrink: 0;
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
  color: #1f2d3d;
  line-height: 1.1;
}

.stat-label {
  font-size: 13px;
  color: #909399;
  margin-top: 4px;
}
</style>
