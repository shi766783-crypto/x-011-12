<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import { ElMessage } from 'element-plus'
import type { CardMastery, Domain, KnowledgeCard } from '@/types'
import { CARD_MASTERY_LEVELS, CARD_MASTERY_TAG_TYPE, DOMAINS } from '@/constants'
import { useCardsStore } from '@/stores/cards'

const cardsStore = useCardsStore()

const keyword = ref('')
const filterDomain = ref<Domain | ''>('')
const filterMastery = ref<CardMastery | ''>('')

const dialogVisible = ref(false)
const editingId = ref<string | null>(null)
const formRef = ref<FormInstance>()

const emptyForm = () => ({
  title: '',
  domain: '编程' as Domain,
  question: '',
  answer: '',
  tagsText: '',
  mastery: '生疏' as CardMastery,
})

const form = reactive(emptyForm())

const rules: FormRules = {
  title: [{ required: true, message: '请输入卡片标题', trigger: 'blur' }],
  question: [{ required: true, message: '请输入问题/概念', trigger: 'blur' }],
  answer: [{ required: true, message: '请输入答案/解释', trigger: 'blur' }],
}

const filteredCards = computed(() => {
  const kw = keyword.value.trim().toLowerCase()
  return cardsStore.cards.filter((c) => {
    if (filterDomain.value && c.domain !== filterDomain.value) return false
    if (filterMastery.value && c.mastery !== filterMastery.value) return false
    if (!kw) return true
    return (
      c.title.toLowerCase().includes(kw) ||
      c.question.toLowerCase().includes(kw) ||
      c.tags.some((t) => t.toLowerCase().includes(kw))
    )
  })
})

function parseTags(text: string): string[] {
  return [...new Set(text.split(/[,，\s]+/).map((t) => t.trim()).filter(Boolean))]
}

function openCreate(): void {
  editingId.value = null
  Object.assign(form, emptyForm())
  dialogVisible.value = true
}

function openEdit(card: KnowledgeCard): void {
  editingId.value = card.id
  Object.assign(form, {
    title: card.title,
    domain: card.domain,
    question: card.question,
    answer: card.answer,
    tagsText: card.tags.join(', '),
    mastery: card.mastery,
  })
  dialogVisible.value = true
}

async function save(): Promise<void> {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return
  const payload = {
    title: form.title.trim(),
    domain: form.domain,
    question: form.question.trim(),
    answer: form.answer.trim(),
    tags: parseTags(form.tagsText),
    mastery: form.mastery,
  }
  if (editingId.value) {
    cardsStore.updateCard(editingId.value, payload)
    ElMessage.success('卡片已更新')
  } else {
    cardsStore.addCard(payload)
    ElMessage.success('卡片已创建')
  }
  dialogVisible.value = false
}

function removeCard(card: KnowledgeCard): void {
  cardsStore.removeCard(card.id)
  ElMessage.success('卡片已删除')
}
</script>

<template>
  <div>
    <div class="page-header">
      <h2 class="page-title">知识卡片</h2>
      <el-button type="primary" @click="openCreate">新建卡片</el-button>
    </div>

    <div class="filter-bar">
      <el-input v-model="keyword" placeholder="搜索标题/问题/标签" clearable style="width: 240px" />
      <el-select v-model="filterDomain" placeholder="全部领域" clearable style="width: 140px">
        <el-option v-for="d in DOMAINS" :key="d" :label="d" :value="d" />
      </el-select>
      <el-select v-model="filterMastery" placeholder="全部掌握程度" clearable style="width: 160px">
        <el-option v-for="m in CARD_MASTERY_LEVELS" :key="m" :label="m" :value="m" />
      </el-select>
    </div>

    <el-empty v-if="filteredCards.length === 0" description="暂无知识卡片" />

    <div class="card-grid">
      <el-card v-for="card in filteredCards" :key="card.id" class="knowledge-card" shadow="hover">
        <div class="kc-head">
          <span class="kc-title">{{ card.title }}</span>
          <el-tag size="small" :type="CARD_MASTERY_TAG_TYPE[card.mastery]">{{ card.mastery }}</el-tag>
        </div>
        <div class="kc-domain">
          <el-tag size="small" effect="plain">{{ card.domain }}</el-tag>
          <span class="kc-count">复习 {{ card.reviewCount }} 次</span>
        </div>
        <div class="kc-block">
          <div class="kc-label">问题 / 概念</div>
          <div class="kc-text">{{ card.question }}</div>
        </div>
        <div class="kc-block">
          <div class="kc-label">答案 / 解释</div>
          <div class="kc-text">{{ card.answer }}</div>
        </div>
        <div class="kc-tags">
          <el-tag v-for="t in card.tags" :key="t" size="small" type="info" effect="plain">{{ t }}</el-tag>
        </div>
        <div class="kc-actions">
          <el-button size="small" @click="openEdit(card)">编辑</el-button>
          <el-popconfirm title="确定删除该卡片？" @confirm="removeCard(card)">
            <template #reference>
              <el-button size="small" type="danger">删除</el-button>
            </template>
          </el-popconfirm>
        </div>
      </el-card>
    </div>

    <el-dialog
      v-model="dialogVisible"
      :title="editingId ? '编辑卡片' : '新建卡片'"
      width="560px"
      destroy-on-close
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-width="96px">
        <el-form-item label="卡片标题" prop="title">
          <el-input v-model="form.title" placeholder="如：闭包是什么" />
        </el-form-item>
        <el-form-item label="所属领域" prop="domain">
          <el-select v-model="form.domain" style="width: 100%">
            <el-option v-for="d in DOMAINS" :key="d" :label="d" :value="d" />
          </el-select>
        </el-form-item>
        <el-form-item label="问题/概念" prop="question">
          <el-input v-model="form.question" type="textarea" :rows="2" placeholder="要记忆的问题或概念" />
        </el-form-item>
        <el-form-item label="答案/解释" prop="answer">
          <el-input v-model="form.answer" type="textarea" :rows="4" placeholder="对应的答案或解释" />
        </el-form-item>
        <el-form-item label="标签" prop="tagsText">
          <el-input v-model="form.tagsText" placeholder="多个标签用逗号分隔，如：前端, JavaScript" />
        </el-form-item>
        <el-form-item label="掌握程度" prop="mastery">
          <el-select v-model="form.mastery" style="width: 100%">
            <el-option v-for="m in CARD_MASTERY_LEVELS" :key="m" :label="m" :value="m" />
          </el-select>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="save">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.filter-bar {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
}

.knowledge-card {
  display: flex;
  flex-direction: column;
}

.kc-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.kc-title {
  font-size: 16px;
  font-weight: 600;
  color: #1f2d3d;
}

.kc-domain {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 8px 0 12px;
}

.kc-count {
  font-size: 12px;
  color: #909399;
}

.kc-block {
  margin-bottom: 10px;
}

.kc-label {
  font-size: 12px;
  color: #909399;
  margin-bottom: 4px;
}

.kc-text {
  font-size: 14px;
  color: #303133;
  white-space: pre-wrap;
  word-break: break-word;
  max-height: 120px;
  overflow-y: auto;
}

.kc-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 4px;
}

.kc-actions {
  display: flex;
  gap: 8px;
  margin-top: 14px;
}
</style>
