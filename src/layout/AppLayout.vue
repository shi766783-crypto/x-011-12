<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

interface NavItem {
  path: string
  title: string
  icon: string
}

const navItems: NavItem[] = [
  { path: '/dashboard', title: '学习看板', icon: '📊' },
  { path: '/plans', title: '学习计划', icon: '🎯' },
  { path: '/logs', title: '学习日志', icon: '📝' },
  { path: '/cards', title: '知识卡片', icon: '📚' },
  { path: '/review', title: '卡片复习', icon: '🔁' },
  { path: '/challenges', title: '学习挑战', icon: '🏅' },
  { path: '/leaderboard', title: '排行榜', icon: '🏆' },
  { path: '/profile', title: '个人中心', icon: '👤' },
]

const route = useRoute()
const router = useRouter()
const activePath = computed(() => route.path)

function navigate(path: string): void {
  router.push(path)
}
</script>

<template>
  <el-container class="layout">
    <el-aside width="220px" class="aside">
      <div class="brand">
        <span class="brand-icon">🏠</span>
        <span class="brand-text">知识管家</span>
      </div>
      <el-menu :default-active="activePath" class="menu" @select="navigate">
        <el-menu-item v-for="item in navItems" :key="item.path" :index="item.path">
          <span class="menu-icon">{{ item.icon }}</span>
          <span>{{ item.title }}</span>
        </el-menu-item>
      </el-menu>
    </el-aside>

    <el-main class="main">
      <router-view />
    </el-main>
  </el-container>
</template>

<style scoped>
.layout {
  min-height: 100vh;
}

.aside {
  background: #1f2d3d;
  display: flex;
  flex-direction: column;
}

.brand {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 20px 20px 16px;
  color: #fff;
  font-size: 18px;
  font-weight: 600;
}

.brand-icon {
  font-size: 24px;
}

.menu {
  border-right: none;
  background: transparent;
  flex: 1;
}

.menu :deep(.el-menu-item) {
  color: #c0ccda;
}

.menu :deep(.el-menu-item.is-active) {
  background: #2b3a4a;
  color: #fff;
}

.menu :deep(.el-menu-item:hover) {
  background: #273444;
}

.menu-icon {
  margin-right: 8px;
}

.main {
  background: #f5f7fa;
  padding: 24px;
}
</style>
