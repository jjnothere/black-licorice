<template>
  <div class="auth-container">
    <div class="form-container">
      <h2>Login with LinkedIn</h2>
      <button @click="loginWithLinkedIn">Login with LinkedIn</button>
      <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuth } from '@/composables/auth';

const errorMessage = ref('');
const router = useRouter();
const { setAuth, checkAuthStatus } = useAuth();

const loginWithLinkedIn = async () => {
  console.log("🐒 ~ loginWithLinkedIn:");
  try {
    // Redirect the user to LinkedIn login via the backend
    window.location.href = 'http://localhost:8000/auth/linkedin'; // This initiates LinkedIn OAuth
  } catch (error) {
    errorMessage.value = 'Login failed. Please try again.';
    console.error('Error during login:', error);
  }
};
onMounted(() => {
  // Log full URL to ensure we're on the right page
  console.log("Full URL:", window.location.href);

  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get('token'); // Extract token from URL

  console.log("Extracted token:", token);  // Ensure token is being extracted

  if (token) {
    // Store the token in localStorage
    localStorage.setItem('token', token);
    console.log("Stored token in localStorage:", localStorage.getItem('token')); // Log to confirm storage

    // Mark the user as authenticated
    setAuth(true);

    // Optionally redirect to another route
    router.push('/history'); // Adjust the route if necessary
  } else {
    console.log('No token found, checking auth status');
    checkAuthStatus(router);  // Fallback if no token is found
  }
});
</script>

<style scoped>
.auth-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #f5f5f5;
}

.form-container {
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  width: 300px;
  text-align: center;
}

button {
  width: 100%;
  padding: 10px;
  background-color: #61bca8ff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

button:hover {
  background-color: rgb(61, 120, 107);
}

.error-message {
  margin-top: 10px;
  border-radius: 8px;
  color: #ff4a4a;
  padding: 3px 0;
  cursor: default;
}

.error-message:hover {
  text-decoration: none;
}
</style>