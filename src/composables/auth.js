import { ref, reactive } from 'vue'
import api from '@/api'
import { jwtDecode } from 'jwt-decode'

const isLoggedIn = ref(false)
const user = reactive({
  email: '',
  accountId: ''
})

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

// Helper function to retrieve the token from cookies
const getTokenFromCookies = () => {
  const cookie = document.cookie.split('; ').find((row) => row.startsWith('accessToken='))
  return cookie ? cookie.split('=')[1] : null
}

export function useAuth() {
  // Function to set authentication status
  const setAuth = (isAuthenticated) => {
    isLoggedIn.value = isAuthenticated
  }

  // Check authentication status and get user profile if token exists
  // checkAuthStatus function
  const checkAuthStatus = async () => {
    const token = getTokenFromCookies() // Retrieves token from cookies

    if (token && !isTokenExpired(token)) {
      try {
        const response = await api.get('/api/user-profile', {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true
        })
        setAuth(true)
        user.email = response.data.email
        user.accountId = response.data.accountId
      } catch (error) {
        console.error('🐒 ~ Error retrieving user profile:', error)
        document.cookie = 'accessToken=; Max-Age=0' // Clear token if request fails
        setAuth(false)
      }
    } else {
      setAuth(false)
    }
  }

  // Function to set initial auth state on app creation
  const setInitialAuthState = () => {
    const token = getTokenFromCookies()
    isLoggedIn.value = token && !isTokenExpired(token)
  }

  return {
    isLoggedIn,
    user,
    setAuth,
    checkAuthStatus,
    setInitialAuthState // Export the new function
  }
}
