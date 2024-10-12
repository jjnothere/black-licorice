import { ref, reactive } from 'vue'
import api from '@/api'

const isLoggedIn = ref(false)
const user = reactive({
  email: '',
  accountId: ''
})

export function useAuth() {
  const setAuth = (isAuthenticated) => {
    isLoggedIn.value = isAuthenticated
  }

  const checkAuthStatus = async (router) => {
    const token = localStorage.getItem('token')
    if (token) {
      try {
        const response = await api.get('/api/user-profile', {
          headers: { Authorization: `Bearer ${token}` }
        })
        isLoggedIn.value = true
        user.email = response.data.email
        user.accountId = response.data.accountId
        router.push('/history')
      } catch {
        localStorage.removeItem('token')
        isLoggedIn.value = false
        user.email = ''
        user.accountId = ''
      }
    } else {
      isLoggedIn.value = false
      user.email = ''
      user.accountId = ''
    }
  }

  return {
    isLoggedIn,
    user,
    setAuth,
    checkAuthStatus
  }
}
