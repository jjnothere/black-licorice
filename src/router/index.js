import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomePage.vue'
import BudgetTracker from '@/views/BudgetPacing.vue'
import History from '@/views/HistoryPage.vue'
import Auth from '@/views/AuthVue.vue'
import AuthLayout from '@/components/AuthLayout.vue'
import Profile from '@/views/ProfilePage.vue'
import { useAuth, isTokenExpired } from '@/composables/auth'

const { setAuth } = useAuth()

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
    meta: { requiresAuth: true }
  },
  {
    path: '/history',
    name: 'History',
    component: History,
    meta: { requiresAuth: true },
    props: (route) => ({
      startDate: route.query.start || '',
      endDate: route.query.end || ''
    })
  },
  {
    path: '/auth',
    component: AuthLayout,
    children: [
      { path: '', name: 'Auth', component: Auth },
      { path: 'linkedin', name: 'LinkedInAuth', component: Auth }
    ]
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

  if (to.path.startsWith('/auth')) {
    return next()
  }

  // Check if the route requires authentication
  if (to.meta.requiresAuth) {
    const urlParams = new URLSearchParams(window.location.search)
    const urlToken = urlParams.get('token')

    if (!token && !urlToken) {
      // No stored token and no token in URL, redirect to auth
      setAuth(false)
      return next('/auth')
    }

    if (urlToken) {
      localStorage.setItem('token', urlToken)
      localStorage.setItem('refreshToken', urlParams.get('refreshToken'))
      setAuth(true)
      return next() // Allow navigation once token is stored
    }

    if (isTokenExpired(token)) {
      localStorage.removeItem('token')
      setAuth(false)
      return next('/auth')
    }
  }

  next()
})

export default router
