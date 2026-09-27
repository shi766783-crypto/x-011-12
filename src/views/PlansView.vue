<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import { ElMessage } from 'element-plus'
import type { Domain, StudyPlan, StudyResource } from '@/types'
import { DOMAINS } from '@/constants'
import { computePlanProgress } from '@/utils/progress'
import { today } from '@/utils/date'
import { uid } from '@/utils/id'
import { useLogsStore } from '@/stores/logs'
import { usePlansStore } from '@/stores/plans'

const plansStore = usePlansStore()
const logsStore = useLogsStore()

const dialogVisible = ref(false)
const editingId = ref<string | null>(null)
const formRef = ref<FormInstance>()

const emptyForm = (): {
  name: string
  domain: Domain
  goal: string
  startDate: string
  endDate: string
  totalHours: number
  dailyHours: number
  resources: StudyResource[]
} => ({
  name: '',
  domain: '编程',
  goal: '',
  startDate: today(),
  endDate: '',
  totalHours: 100,
  dailyHours: 2,
  resources: [],
})

const form = reactive(emptyForm())

const rules: FormRules = {
  name: [{ required: true, message: '请输入计划名称', trigger: 'blur' }],
  startDate: [{ required: true, message: '请选择开始日期', trigger: 'change' }],
  endDate: [{ required: true, message: '请选择结束日期', trigger: 'change' }],
  totalHours: [{ required: true, message: '请输入预计总学时', trigger: 'blur' }],
  dailyHours: [{ required: true, message: '请输入每日学习时长', trigger: 'blur' }],
}

const planViews = computed(() =>
  plansStore.plans.map((plan) => ({
    plan,
    progress: computePlanProgress(plan, logsStore.logs),
  })),
)

const statusTagType: Record<string, 'info' | 'success' | 'danger' | 'primary'> = {
  未开始: 'info',
  进行中: 'primary',
  已完成: 'success',
  已逾期: 'danger',
}

function openCreate(): void {
  editingId.value = null
  Object.assign(form, emptyForm())
  dialogVisible.value = true
}

function openEdit(plan: StudyPlan): void {
  editingId.value = plan.id
  Object.assign(form, {
    name: plan.name,
    domain: plan.domain,
    goal: plan.goal,
    startDate: plan.startDate,
    endDate: plan.endDate,
    totalHours: plan.totalHours,
    dailyHours: plan.dailyHours,
    resources: plan.resources.map((r) => ({ ...r })),
  })
  dialogVisible.value = true
}

function addResource(): void {
  form.resources.push({ id: uid(), name: '', link: '' })
}

function removeResource(index: number): void {
  form.resources.splice(index, 1)
}

async function save(): Promise<void> {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return
  const payload = {
    name: form.name.trim(),
    domain: form.domain,
    goal: form.goal.trim(),
    startDate: form.startDate,
    endDate: form.endDate,
    totalHours: form.totalHours,
    dailyHours: form.dailyHours,
    resources: form.resources.filter((r) => r.name.trim() !== ''),
  }
  if (editingId.value) {
    plansStore.updatePlan(editingId.value, payload)
    ElMessage.success('计划已更新')
  } else {
    plansStore.addPlan(payload)
    ElMessage.success('计划已创建')
  }
  dialogVisible.value = false
}

function removePlan(plan: StudyPlan): void {
  plansStore.removePlan(plan.id)
  ElMessage.success('计划已删除')
}
</script>

<template>
  <div>
    <div class="page-header">
      <h2 class="page-title">学习计划</h2>
      <el-button type="primary" @click="openCreate">新建计划</el-button>
    </div>

    <el-empty v-if="planViews.length === 0" description="还没有学习计划，点击右上角新建" />

    <div class="plan-list">
      <el-card v-for="{ plan, progress } in planViews" :key="plan.id" class="plan-card" shadow="hover">
        <div class="plan-head">
          <div class="plan-title">
            <span class="plan-name">{{ plan.name }}</span>
            <el-tag size="small" :type="statusTagType[progress.status]">{{ progress.status }}</el-tag>
          </div>
          <el-tag size="small" effect="plain">{{ plan.domain }}</el-tag>
        </div>

        <p class="plan-goal">{{ plan.goal || '暂无目标描述' }}</p>

        <el-progress
          :percentage="progress.percent"
          :status="progress.status === '已逾期' ? 'exception' : progress.status === '已完成' ? 'success' : undefined"
          :stroke-width="12"
        />

        <div class="plan-meta">
          <span>已过 {{ progress.elapsedDays }} 天</span>
          <span>剩余 {{ progress.remainingDays }} 天</span>
          <span>应完成 {{ progress.shouldHours }}h</span>
          <span>实际 {{ progress.actualHours }}h / {{ plan.totalHours }}h</span>
        </div>

        <div class="plan-resources" v-if="plan.resources.length">
          <el-link
            v-for="r in plan.resources"
            :key="r.id"
            type="primary"
            :href="r.link || undefined"
            :target="r.link ? '_blank' : undefined"
            class="resource-link"
          >
            {{ r.name }}
          </el-link>
        </div>

        <div class="plan-actions">
          <el-button size="small" @click="openEdit(plan)">编辑</el-button>
          <el-button
            v-if="progress.status !== '已完成'"
            size="small"
            type="success"
            @click="plansStore.toggleComplete(plan.id)"
          >
            标记完成
          </el-button>
          <el-popconfirm title="确定删除该计划？" @confirm="removePlan(plan)">
            <template #reference>
              <el-button size="small" type="danger">删除</el-button>
            </template>
          </el-popconfirm>
        </div>
      </el-card>
    </div>

    <el-dialog
      v-model="dialogVisible"
      :title="editingId ? '编辑计划' : '新建计划'"
      width="560px"
      destroy-on-close
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-width="96px">
        <el-form-item label="计划名称" prop="name">
          <el-input v-model="form.name" placeholder="如：三个月攻克雅思" />
        </el-form-item>
        <el-form-item label="学习领域" prop="domain">
          <el-select v-model="form.domain" style="width: 100%">
            <el-option v-for="d in DOMAINS" :key="d" :label="d" :value="d" />
          </el-select>
        </el-form-item>
        <el-form-item label="目标描述" prop="goal">
          <el-input v-model="form.goal" type="textarea" :rows="2" placeholder="描述你想达成的目标" />
        </el-form-item>
        <el-form-item label="开始日期" prop="startDate">
          <el-date-picker v-model="form.startDate" type="date" value-format="YYYY-MM-DD" style="width: 100%" />
        </el-form-item>
        <el-form-item label="结束日期" prop="endDate">
          <el-date-picker v-model="form.endDate" type="date" value-format="YYYY-MM-DD" style="width: 100%" />
        </el-form-item>
        <el-form-item label="预计总学时" prop="totalHours">
          <el-input-number v-model="form.totalHours" :min="1" :step="10" style="width: 100%" />
        </el-form-item>
        <el-form-item label="每日时长" prop="dailyHours">
          <el-input-number v-model="form.dailyHours" :min="0.5" :step="0.5" style="width: 100%" />
        </el-form-item>

        <el-form-item label="学习资源">
          <div class="resource-editor">
            <div v-for="(r, i) in form.resources" :key="r.id" class="resource-row">
              <el-input v-model="r.name" placeholder="资源名称" />
              <el-input v-model="r.link" placeholder="链接(可选)" />
              <el-button type="danger" plain @click="removeResource(i)">删除</el-button>
            </div>
            <el-button type="primary" plain @click="addResource">+ 添加资源</el-button>
          </div>
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
.plan-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 16px;
}

.plan-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.plan-title {
  display: flex;
  align-items: center;
  gap: 8px;
}

.plan-name {
  font-size: 16px;
  font-weight: 600;
  color: #1f2d3d;
}

.plan-goal {
  color: #606266;
  font-size: 13px;
  min-height: 36px;
  margin: 8px 0 12px;
}

.plan-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  font-size: 12px;
  color: #909399;
  margin-top: 10px;
}

.plan-resources {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 10px;
}

.resource-link {
  font-size: 12px;
}

.plan-actions {
  display: flex;
  gap: 8px;
  margin-top: 14px;
}

.resource-editor {
  width: 100%;
}

.resource-row {
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
}
</style>
