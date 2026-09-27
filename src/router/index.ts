import { createRouter, createWebHistory } from 'vue-router'
import AppLayout from '@/layout/AppLayout.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      component: AppLayout,
      redirect: '/dashboard',
      children: [
        {
          path: 'dashboard',
          name: 'dashboard',
          component: () => import('@/views/DashboardView.vue'),
          meta: { title: '学习看板' },
        },
        {
          path: 'plans',
          name: 'plans',
          component: () => import('@/views/PlansView.vue'),
          meta: { title: '学习计划' },
        },
        {
          path: 'logs',
          name: 'logs',
          component: () => import('@/views/LogsView.vue'),
          meta: { title: '学习日志' },
        },
        {
          path: 'cards',
          name: 'cards',
          component: () => import('@/views/CardsView.vue'),
          meta: { title: '知识卡片' },
        },
        {
          path: 'review',
          name: 'review',
          component: () => import('@/views/ReviewView.vue'),
          meta: { title: '卡片复习' },
        },
        {
          path: 'challenges',
          name: 'challenges',
          component: () => import('@/views/ChallengesView.vue'),
          meta: { title: '学习挑战' },
        },
        {
          path: 'leaderboard',
          name: 'leaderboard',
          component: () => import('@/views/LeaderboardView.vue'),
          meta: { title: '排行榜' },
        },
        {
          path: 'profile',
          name: 'profile',
          component: () => import('@/views/ProfileView.vue'),
          meta: { title: '个人中心' },
        },
      ],
    },
  ],
})

export default router
