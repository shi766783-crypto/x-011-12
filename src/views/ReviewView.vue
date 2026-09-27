<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import type { CardMastery, KnowledgeCard } from '@/types'
import { CARD_MASTERY_LEVELS } from '@/constants'
import { useCardsStore } from '@/stores/cards'

const cardsStore = useCardsStore()
const router = useRouter()

const queue = ref<KnowledgeCard[]>([])
const index = ref(0)
const revealed = ref(false)
const counts = ref<Record<CardMastery, number>>({ 生疏: 0, 熟悉: 0, 精通: 0 })

const current = computed(() => queue.value[index.value])
const finished = computed(() => queue.value.length > 0 && index.value >= queue.value.length)
const total = computed(() => queue.value.length)
const progress = computed(() =>
  total.value === 0 ? 0 : Math.min((index.value / total.value) * 100, 100),
)

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/** 生疏卡片优先，同级随机 */
function buildQueue(): KnowledgeCard[] {
  const groups: Record<CardMastery, KnowledgeCard[]> = { 生疏: [], 熟悉: [], 精通: [] }
  cardsStore.cards.forEach((c) => groups[c.mastery].push(c))
  return [
    ...shuffle(groups.生疏),
    ...shuffle(groups.熟悉),
    ...shuffle(groups.精通),
  ]
}

function start(): void {
  queue.value = buildQueue()
  index.value = 0
  revealed.value = false
  counts.value = { 生疏: 0, 熟悉: 0, 精通: 0 }
}

function reveal(): void {
  revealed.value = true
}

function mark(mastery: CardMastery): void {
  if (!current.value) return
  cardsStore.markReviewed(current.value.id, mastery)
  counts.value[mastery] += 1
  revealed.value = false
  index.value += 1
}

// 进入页面即开始一轮
start()
</script>

<template>
  <div>
    <div class="page-header">
      <h2 class="page-title">卡片复习</h2>
      <el-button @click="start">重新开始</el-button>
    </div>

    <el-empty v-if="cardsStore.cards.length === 0" description="还没有知识卡片，先去创建几张吧">
      <el-button type="primary" @click="router.push('/cards')">去创建卡片</el-button>
    </el-empty>

    <template v-else>
      <div class="review-progress">
        <el-progress :percentage="progress" :stroke-width="10" />
        <span class="review-count">{{ Math.min(index, total) }} / {{ total }}</span>
      </div>

      <div v-if="!finished && current" class="review-stage">
        <el-card class="review-card" shadow="hover">
          <div class="review-domain">
            <el-tag size="small" effect="plain">{{ current.domain }}</el-tag>
            <el-tag size="small" type="info" effect="plain">{{ current.title }}</el-tag>
          </div>

          <div class="review-section">
            <div class="review-label">问题 / 概念</div>
            <div class="review-question">{{ current.question }}</div>
          </div>

          <div v-if="revealed" class="review-section">
            <div class="review-label">答案 / 解释</div>
            <div class="review-answer">{{ current.answer }}</div>
          </div>

          <div class="review-actions">
            <el-button v-if="!revealed" type="primary" size="large" @click="reveal">显示答案</el-button>
            <template v-else>
              <span class="mark-tip">自测后标记掌握程度：</span>
              <el-button v-for="m in CARD_MASTERY_LEVELS" :key="m" size="large" @click="mark(m)">
                {{ m }}
              </el-button>
            </template>
          </div>
        </el-card>
      </div>

      <el-card v-else-if="finished" class="review-done" shadow="hover">
        <div class="done-icon">🎉</div>
        <h3>本轮复习完成！</h3>
        <p>生疏 {{ counts.生疏 }} · 熟悉 {{ counts.熟悉 }} · 精通 {{ counts.精通 }}</p>
        <el-button type="primary" @click="start">再来一轮</el-button>
      </el-card>
    </template>
  </div>
</template>

<style scoped>
.review-progress {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
}

.review-count {
  font-size: 13px;
  color: #606266;
  white-space: nowrap;
}

.review-stage {
  max-width: 720px;
  margin: 0 auto;
}

.review-domain {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
}

.review-section {
  margin-bottom: 18px;
}

.review-label {
  font-size: 13px;
  color: #909399;
  margin-bottom: 8px;
}

.review-question {
  font-size: 18px;
  font-weight: 600;
  color: #1f2d3d;
  line-height: 1.6;
  white-space: pre-wrap;
}

.review-answer {
  font-size: 15px;
  color: #303133;
  line-height: 1.7;
  white-space: pre-wrap;
  background: #f5f7fa;
  padding: 16px;
  border-radius: 8px;
}

.review-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  margin-top: 8px;
}

.mark-tip {
  font-size: 14px;
  color: #606266;
}

.review-done {
  max-width: 480px;
  margin: 40px auto;
  text-align: center;
}

.done-icon {
  font-size: 56px;
}
</style>
