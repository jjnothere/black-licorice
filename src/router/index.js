import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/Home.vue'
import BudgetTracker from '@/views/BudgetPacing.vue'
import History from '@/views/History.vue'
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
    meta: { requiresAuth: true }
  },
  {
    path: '/history',
    name: 'History',
    component: History, // Ensure the correct component is here
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
