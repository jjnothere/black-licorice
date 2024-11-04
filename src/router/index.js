import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomePage.vue'
import BudgetTracker from '@/views/BudgetPacing.vue'
import History from '@/views/HistoryPage.vue'
import Auth from '@/views/AuthVue.vue'
import AuthLayout from '@/components/AuthLayout.vue'
import Profile from '@/views/ProfilePage.vue'
import { useAuth, isTokenExpired } from '@/composables/auth'

const { setAuth } = useAuth()

// Helper function to retrieve a cookie
const getCookie = (name) => {
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'))
  return match ? decodeURIComponent(match[2]) : null
}

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
  const token = getCookie('accessToken') // Retrieve token from cookies

  if (to.path.startsWith('/auth')) {
    return next() // Allow navigation to /auth routes
  }

  if (to.meta.requiresAuth) {
    if (!token || isTokenExpired(token)) {
      setAuth(false)
      return next('/auth') // Redirect to auth if token missing/expired
    } else {
      setAuth(true)
      return next() // Proceed if token is valid
    }
  }

  next() // Default navigation if no authentication needed
})

export default router
