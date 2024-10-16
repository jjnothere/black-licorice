import { ref, reactive } from 'vue'
import api from '@/api'
import { jwtDecode } from 'jwt-decode'

const isLoggedIn = ref(false)
const user = reactive({
  email: '',
  accountId: ''
})

// Helper function to check if the token is expired
// Helper function to check if the token is expired
export const isTokenExpired = (token) => {
  const isJwt = (token) => token.split('.').length === 3
  if (!isJwt(token)) {
    return false
  }

  try {
    const decodedToken = jwtDecode(token)
    const { exp } = decodedToken
    return Date.now() >= exp * 1000
  } catch (error) {
    console.error('Error decoding token:', error)
    return true
  }
}

export function useAuth() {
  // Function to set authentication status
  const setAuth = (isAuthenticated) => {
    isLoggedIn.value = isAuthenticated
  }

  // Check authentication status and get user profile if token exists
  const checkAuthStatus = async () => {
    const token = localStorage.getItem('token')

    if (token && !isTokenExpired(token)) {
      try {
        const response = await api.get('/api/user-profile', {
          headers: { Authorization: `Bearer ${token}` }
        })
        isLoggedIn.value = true
        user.email = response.data.email
        user.accountId = response.data.accountId
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

  // Function to set initial auth state on app creation
  const setInitialAuthState = () => {
    const token = localStorage.getItem('token')
    if (token && !isTokenExpired(token)) {
      isLoggedIn.value = true
    } else {
      isLoggedIn.value = false
    }
  }

  return {
    isLoggedIn,
    user,
    setAuth,
    checkAuthStatus,
    setInitialAuthState // Export the new function
  }
}
