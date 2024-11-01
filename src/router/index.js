import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomePage.vue'
import BudgetTracker from '@/views/BudgetPacing.vue'
import History from '@/views/HistoryPage.vue'
import Auth from '@/views/AuthVue.vue'
import AuthLayout from '@/components/AuthLayout.vue'
import Profile from '@/views/ProfilePage.vue'
import { useAuth, isTokenExpired } from '@/composables/auth'

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

  // Temporarily comment out the auth redirect for debugging
  if (token && !isLoggedIn.value) {
    // Set auth state if token is valid
    if (!isTokenExpired(token)) {
      setAuth(true)
      return next()
    } else {
      localStorage.removeItem('token')
      setAuth(false)
      // Comment this line out temporarily
      return next('/auth')
    }
  }

  if (!token && to.meta.requiresAuth) {
    // Comment this line out temporarily
    return next('/auth')
  }

  next()
})

export default router
