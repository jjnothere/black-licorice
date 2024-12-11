// router.js
import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomePage.vue'
import BudgetTracker from '@/views/BudgetPacing.vue'
import History from '@/views/HistoryPage.vue'
import Auth from '@/views/AuthVue.vue'
import AuthLayout from '@/components/AuthLayout.vue'
import Profile from '@/views/ProfilePage.vue'
import { useAuth, isTokenExpired } from '@/composables/auth'
import axios from 'axios'

const { setAuth } = useAuth()

// Helper function to retrieve a cookie
function getCookie(name) {
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
  const token = getCookie('accessToken')
  const requiresAuth = to.matched.some((record) => record.meta.requiresAuth)

  // If the route doesn't require auth, just proceed
  if (!requiresAuth) {
    return next()
  }

  // We have an access token. Check if it's expired.
  if (!token || isTokenExpired(token)) {
    // Token is expired. Let's attempt to refresh.
    const refreshToken = getCookie('refreshToken')
    if (!refreshToken) {
      // No refresh token means we can't refresh
      setAuth(false)
      return next('/auth')
    }

    // Attempt to refresh the token
    try {
      await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/refresh-token`,
        {},
        { withCredentials: true }
      )
      // If successful, we have a new access token now.
      setAuth(true) // User is still authenticated
      return next() // Proceed to the requested route
    } catch (error) {
      console.error('Refresh token failed:', error)
      setAuth(false)
      return next('/auth')
    }
  } else {
    // Token is valid, user is authenticated
    setAuth(true)
    return next()
  }
})

export default router
