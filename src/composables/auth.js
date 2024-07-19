import { ref, reactive } from 'vue';
import axios from 'axios';

const isLoggedIn = ref(false);
const user = reactive({
  email: '',
  accountId: ''
});

export function useAuth() {
  const setAuth = (isAuthenticated) => {
    isLoggedIn.value = isAuthenticated;
  };

  const checkAuthStatus = async () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const response = await axios.get('/api/user-profile', {
          headers: { Authorization: `Bearer ${token}` },
        });
        isLoggedIn.value = true;
        user.email = response.data.email;
        user.accountId = response.data.accountId;
      } catch {
        isLoggedIn.value = false;
        user.email = '';
        user.accountId = '';
      }
    } else {
      isLoggedIn.value = false;
      user.email = '';
      user.accountId = '';
    }
  };

  return {
    isLoggedIn,
    user,
    setAuth,
    checkAuthStatus,
  };
}