import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/Home.vue'
import BudgetTracker from '@/views/BudgetPacing.vue'
import HistoryChecker from '@/components/HistoryChecker.vue'
import Auth from '@/views/Auth.vue'
import AuthLayout from '@/components/AuthLayout.vue'
import Profile from '@/views/Profile.vue'
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
  console.log('Token from localStorage:', token) // Check if token is being retrieved correctly

  // Temporarily comment out the auth redirect for debugging
  if (token && !isLoggedIn.value) {
    // Set auth state if token is valid
    if (!isTokenExpired(token)) {
      setAuth(true)
      console.log('Token is valid, proceeding to next route')
      return next()
    } else {
      console.log('Token is expired, redirecting to auth')
      localStorage.removeItem('token')
      setAuth(false)
      // Comment this line out temporarily
      // return next('/auth');
    }
  }

  if (!token && to.meta.requiresAuth) {
    console.log('No token found, staying on the page for debugging')
    // Comment this line out temporarily
    // return next('/auth');
  }

  next()
})

export default router
