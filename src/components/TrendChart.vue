<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import type { TrendPoint } from '@/types'

const props = defineProps<{ data: TrendPoint[] }>()

const canvasRef = ref<HTMLCanvasElement | null>(null)
let resizeObserver: ResizeObserver | null = null

const PADDING = { top: 16, right: 16, bottom: 30, left: 42 }
const BAR_COLOR = '#409eff'
const LINE_COLOR = '#1f2d3d'

function draw(): void {
  const canvas = canvasRef.value
  if (!canvas) return
  const dpr = window.devicePixelRatio || 1
  const width = canvas.clientWidth
  const height = canvas.clientHeight
  if (width === 0 || height === 0) return

  canvas.width = Math.round(width * dpr)
  canvas.height = Math.round(height * dpr)

  const ctx = canvas.getContext('2d')
  if (!ctx) return
  ctx.scale(dpr, dpr)
  ctx.clearRect(0, 0, width, height)

  const chartW = width - PADDING.left - PADDING.right
  const chartH = height - PADDING.top - PADDING.bottom
  const n = props.data.length
  if (n === 0) return

  const maxValue = Math.max(2, ...props.data.map((p) => p.duration))
  const niceMax = Math.ceil(maxValue)
  const slot = chartW / n
  const barWidth = Math.min(slot * 0.6, 28)

  // 网格与 y 轴刻度
  ctx.font = '11px sans-serif'
  ctx.textAlign = 'right'
  ctx.textBaseline = 'middle'
  const gridLines = 4
  for (let i = 0; i <= gridLines; i++) {
    const y = PADDING.top + (chartH / gridLines) * i
    const value = niceMax - (niceMax / gridLines) * i
    ctx.strokeStyle = '#ebeef5'
    ctx.beginPath()
    ctx.moveTo(PADDING.left, y)
    ctx.lineTo(width - PADDING.right, y)
    ctx.stroke()
    ctx.fillStyle = '#909399'
    ctx.fillText(formatValue(value), PADDING.left - 8, y)
  }

  // 柱状图
  props.data.forEach((point, i) => {
    const x = PADDING.left + slot * i + (slot - barWidth) / 2
    const h = (point.duration / niceMax) * chartH
    const y = PADDING.top + chartH - h
    ctx.fillStyle = point.duration > 0 ? BAR_COLOR : '#e4e7ed'
    ctx.fillRect(x, y, barWidth, h)
  })

  // 折线叠加
  ctx.strokeStyle = LINE_COLOR
  ctx.lineWidth = 1.5
  ctx.beginPath()
  props.data.forEach((point, i) => {
    const x = PADDING.left + slot * i + slot / 2
    const y = PADDING.top + chartH - (point.duration / niceMax) * chartH
    if (i === 0) ctx.moveTo(x, y)
    else ctx.lineTo(x, y)
  })
  ctx.stroke()

  // x 轴标签（首/中/尾）
  ctx.fillStyle = '#909399'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'top'
  const labelIndexes = n === 1 ? [0] : [0, Math.floor((n - 1) / 2), n - 1]
  for (const idx of labelIndexes) {
    const x = PADDING.left + slot * idx + slot / 2
    ctx.fillText(props.data[idx].label, x, height - PADDING.bottom + 8)
  }
}

function formatValue(v: number): string {
  return Number.isInteger(v) ? String(v) : v.toFixed(1)
}

onMounted(() => {
  draw()
  resizeObserver = new ResizeObserver(draw)
  if (canvasRef.value) resizeObserver.observe(canvasRef.value)
})

onBeforeUnmount(() => {
  resizeObserver?.disconnect()
})

watch(() => props.data, draw, { deep: true })
</script>

<template>
  <canvas ref="canvasRef" class="trend-chart" />
</template>

<style scoped>
.trend-chart {
  width: 100%;
  height: 240px;
  display: block;
}
</style>
