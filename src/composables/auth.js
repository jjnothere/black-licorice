import { ref, watchEffect } from 'vue';

const isLoggedIn = ref(false);

const checkAuthStatus = () => {
  const token = localStorage.getItem('token');
  isLoggedIn.value = !!token;
};

const setAuth = (status) => {
  isLoggedIn.value = status;
  if (!status) {
    localStorage.removeItem('token');
  }
};

watchEffect(() => {
  checkAuthStatus();
});

export const useAuth = () => {
  return {
    isLoggedIn,
    setAuth,
    checkAuthStatus,
  };
};