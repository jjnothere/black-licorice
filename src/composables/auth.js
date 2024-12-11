import { ref, reactive } from 'vue'
import api from '@/api'
import { jwtDecode } from 'jwt-decode'

const isLoggedIn = ref(false)
const user = reactive({
  email: '',
  accountId: ''
})

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

const getTokenFromCookies = () => {
  const cookie = document.cookie.split('; ').find((row) => row.startsWith('accessToken='))
  return cookie ? cookie.split('=')[1] : null
}

export function useAuth() {
  const setAuth = (isAuthenticated) => {
    isLoggedIn.value = isAuthenticated
  }

  const checkAuthStatus = async () => {
    const token = getTokenFromCookies()

    if (token && !isTokenExpired(token)) {
      try {
        const response = await api.get('/api/user-profile') // no need for Authorization header anymore, cookies included
        setAuth(true)
        user.email = response.data.email
        user.accountId = response.data.accountId
      } catch (error) {
        console.error('Error retrieving user profile:', error)
        document.cookie = 'accessToken=; Max-Age=0'
        setAuth(false)
      }
    } else {
      setAuth(false)
    }
  }

  const setInitialAuthState = () => {
    const token = getTokenFromCookies()
    isLoggedIn.value = token && !isTokenExpired(token)
  }

  return {
    isLoggedIn,
    user,
    setAuth,
    checkAuthStatus,
    setInitialAuthState
  }
}
