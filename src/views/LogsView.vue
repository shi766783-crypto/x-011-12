<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import { ElMessage } from 'element-plus'
import type { MasteryLevel, StudyLog } from '@/types'
import { today } from '@/utils/date'
import StatCard from '@/components/StatCard.vue'
import TrendChart from '@/components/TrendChart.vue'
import { useLogsStore } from '@/stores/logs'
import { usePlansStore } from '@/stores/plans'
import { useStatsStore } from '@/stores/stats'

const logsStore = useLogsStore()
const plansStore = usePlansStore()
const statsStore = useStatsStore()

const dialogVisible = ref(false)
const editingId = ref<string | null>(null)
const formRef = ref<FormInstance>()

const emptyForm = () => ({
  date: today(),
  planId: '',
  content: '',
  duration: 1,
  mastery: 3 as MasteryLevel,
  problem: '',
  solution: '',
  notes: '',
})

const form = reactive(emptyForm())

const rules: FormRules = {
  date: [{ required: true, message: '请选择日期', trigger: 'change' }],
  content: [{ required: true, message: '请输入学习内容', trigger: 'blur' }],
  duration: [{ required: true, message: '请输入学习时长', trigger: 'blur' }],
}

const planNameMap = computed(() => {
  const map = new Map<string, string>()
  plansStore.plans.forEach((p) => map.set(p.id, p.name))
  return map
})

function openCreate(): void {
  editingId.value = null
  Object.assign(form, emptyForm())
  dialogVisible.value = true
}

function openEdit(log: StudyLog): void {
  editingId.value = log.id
  Object.assign(form, {
    date: log.date,
    planId: log.planId ?? '',
    content: log.content,
    duration: log.duration,
    mastery: log.mastery,
    problem: log.problem,
    solution: log.solution,
    notes: log.notes,
  })
  dialogVisible.value = true
}

async function save(): Promise<void> {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return
  const payload = {
    date: form.date,
    planId: form.planId || undefined,
    content: form.content.trim(),
    duration: form.duration,
    mastery: form.mastery,
    problem: form.problem.trim(),
    solution: form.solution.trim(),
    notes: form.notes.trim(),
  }
  if (editingId.value) {
    logsStore.updateLog(editingId.value, payload)
    ElMessage.success('日志已更新')
  } else {
    logsStore.addLog(payload)
    ElMessage.success('日志已记录')
  }
  dialogVisible.value = false
}

function removeLog(log: StudyLog): void {
  logsStore.removeLog(log.id)
  ElMessage.success('日志已删除')
}
</script>

<template>
  <div>
    <div class="page-header">
      <h2 class="page-title">学习日志</h2>
      <el-button type="primary" @click="openCreate">写日志</el-button>
    </div>

    <div class="card-grid summary">
      <StatCard label="总学习时长(时)" :value="statsStore.stats.totalDuration" icon="⏱️" color="#409eff" />
      <StatCard label="连续学习天数" :value="statsStore.stats.currentStreak" icon="🔥" color="#f56c6c" />
      <StatCard label="平均每日时长(时)" :value="statsStore.stats.averageDailyDuration" icon="📈" color="#67c23a" />
    </div>

    <el-card class="chart-card" shadow="never">
      <template #header>
        <span>近 30 天学习时长趋势</span>
      </template>
      <TrendChart :data="statsStore.stats.trend" />
    </el-card>

    <el-card shadow="never" class="table-card">
      <el-table :data="logsStore.logs" stripe>
        <el-table-column prop="date" label="日期" width="120" />
        <el-table-column prop="content" label="学习内容" min-width="180" show-overflow-tooltip />
        <el-table-column label="关联计划" width="140">
          <template #default="{ row }">{{ planNameMap.get(row.planId) ?? '未关联' }}</template>
        </el-table-column>
        <el-table-column label="时长(时)" width="100">
          <template #default="{ row }">{{ row.duration }}</template>
        </el-table-column>
        <el-table-column label="掌握程度" width="150">
          <template #default="{ row }">
            <el-rate :model-value="row.mastery" disabled />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="140" fixed="right">
          <template #default="{ row }">
            <el-button size="small" @click="openEdit(row)">编辑</el-button>
            <el-popconfirm title="确定删除该日志？" @confirm="removeLog(row)">
              <template #reference>
                <el-button size="small" type="danger">删除</el-button>
              </template>
            </el-popconfirm>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog
      v-model="dialogVisible"
      :title="editingId ? '编辑日志' : '写日志'"
      width="600px"
      destroy-on-close
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-width="96px">
        <el-form-item label="日期" prop="date">
          <el-date-picker v-model="form.date" type="date" value-format="YYYY-MM-DD" style="width: 100%" />
        </el-form-item>
        <el-form-item label="关联计划" prop="planId">
          <el-select v-model="form.planId" clearable placeholder="可选" style="width: 100%">
            <el-option v-for="p in plansStore.plans" :key="p.id" :label="p.name" :value="p.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="学习内容" prop="content">
          <el-input v-model="form.content" placeholder="今天学了什么？" />
        </el-form-item>
        <el-form-item label="学习时长" prop="duration">
          <el-input-number v-model="form.duration" :min="0.5" :step="0.5" style="width: 100%" />
        </el-form-item>
        <el-form-item label="掌握程度" prop="mastery">
          <el-rate v-model="form.mastery" :texts="['刚接触','了解','掌握','熟练','精通']" show-text />
        </el-form-item>
        <el-form-item label="遇到的问题">
          <el-input v-model="form.problem" type="textarea" :rows="2" placeholder="学习中遇到的困难" />
        </el-form-item>
        <el-form-item label="解决方式">
          <el-input v-model="form.solution" type="textarea" :rows="2" placeholder="你是如何解决的" />
        </el-form-item>
        <el-form-item label="学习笔记">
          <el-input v-model="form.notes" type="textarea" :rows="3" placeholder="记录要点与心得" />
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
.summary {
  margin-bottom: 20px;
}

.chart-card {
  margin-bottom: 20px;
}

.table-card {
  overflow: hidden;
}
</style>
