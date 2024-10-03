import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/Home.vue'
import BudgetTracker from '@/views/BudgetPacing.vue'
import HistoryChecker from '@/components/HistoryChecker.vue'
import Auth from '@/views/Auth.vue'
import AuthLayout from '@/components/AuthLayout.vue'
import Profile from '@/views/Profile.vue'
import { useAuth } from '@/composables/auth'
import api from '@/api'

const { isLoggedIn, setAuth } = useAuth()

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView,
    meta: { requiresAuth: true }
  },
  {
    path: '/budget-tracker',
    name: 'BudgetTracker',
    component: BudgetTracker,
    props: (route) => ({
      groupName: route.query.groupName,
      groupBudget: parseFloat(route.query.groupBudget) || 0
    }),
    meta: { requiresAuth: true }
  },
  {
    path: '/history',
    name: 'History',
    component: HistoryChecker,
    props: (route) => ({
      selectedCampaigns: route.query.selectedCampaigns
        ? route.query.selectedCampaigns.split(',')
        : [],
      dateRange: route.query.dateRange ? JSON.parse(route.query.dateRange) : {}
    }),
    meta: { requiresAuth: true }
  },
  {
    path: '/auth',
    component: AuthLayout,
    children: [{ path: '', name: 'Auth', component: Auth }]
  },
  {
    path: '/profile',
    name: 'Profile',
    component: Profile,
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

router.beforeEach(async (to, from, next) => {
  const token = localStorage.getItem('token')
  const isTokenExpired = (token) => {
    try {
      const { exp } = JSON.parse(atob(token.split('.')[1]))
      return Date.now() >= exp * 1000
    } catch {
      return true
    }
  }

  if (to.matched.some((record) => record.meta.requiresAuth)) {
    if (!token || isTokenExpired(token)) {
      setAuth(false)
      next('/auth')
    } else {
      if (!isLoggedIn.value) {
        try {
          await api.get('/api/user-profile', {
            headers: { Authorization: `Bearer ${token}` }
          })
          setAuth(true)
          next()
        } catch (error) {
          localStorage.removeItem('token')
          setAuth(false)
          next('/auth')
        }
      } else {
        next()
      }
    }
  } else {
    next()
  }
})

export default router
