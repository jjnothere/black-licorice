import { createRouter, createWebHistory } from 'vue-router'
import BudgetTracker from '../views/BudgetPacing.vue'
import HomeView from '@/views/Home.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/budget-tracker',
      name: 'BudgetTracker',
      // route level code-splitting
      // this generates a separate chunk (BudgetTracker.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/BudgetPacing.vue')
    },
    {
      path: '/history',
      name: 'History',
      // route level code-splitting
      // this generates a separate chunk (History.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/History.vue')
    }
  ]
})

export default router
