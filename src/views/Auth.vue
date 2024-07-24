<template>
  <div class="auth-container">
    <div class="form-container">
      <h2>{{ isLogin ? 'Login' : 'Sign Up' }}</h2>
      <form @submit.prevent="handleSubmit">
        <div class="form-group">
          <label for="email">Email:</label>
          <input type="email" v-model="email" required />
        </div>
        <div class="form-group">
          <label for="password">Password:</label>
          <input type="password" v-model="password" required />
        </div>
        <div v-if="!isLogin" class="form-group">
          <label for="rePassword">Re-enter Password:</label>
          <input type="password" v-model="rePassword" required />
        </div>
        <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
        <button type="submit">{{ isLogin ? 'Login' : 'Sign Up' }}</button>
      </form>
      <p @click="toggleForm">{{ isLogin ? 'Don\'t have an account? Sign Up' : 'Already have an account? Login' }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import api from '@/api';
import { useRouter } from 'vue-router';
import { useAuth } from '@/composables/auth';

console.log("🐒 ~ API Instance in Auth.vue:", api);

const isLogin = ref(true);
const email = ref('');
const accountId = ref('512388408'); // Default Account ID
const password = ref('');
const rePassword = ref('');
const errorMessage = ref('');
const router = useRouter();
const { setAuth } = useAuth();

const toggleForm = () => {
  isLogin.value = !isLogin.value;
  errorMessage.value = ''; // Clear error message when toggling form
  email.value = ''; // Clear email input
  password.value = ''; // Clear password input
  rePassword.value = ''; // Clear rePassword input
};

const handleSubmit = async () => {
  errorMessage.value = ''; // Clear error message before submission

  if (password.value.length < 6) {
    errorMessage.value = 'Password must be at least 6 characters long.';
    return;
  }

  if (!isLogin.value && password.value !== rePassword.value) {
    errorMessage.value = 'Passwords do not match.';
    return;
  }

  try {
    const url = isLogin.value ? '/login' : '/signup';
    const data = isLogin.value 
      ? { email: email.value, password: password.value } 
      : { email: email.value, password: password.value, rePassword: rePassword.value, accountId: accountId.value }; // Include accountId in signup

    const response = await api.post(url, data);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      setAuth(true); // Update auth state
      router.push('/'); // Redirect to home page upon successful signup
    }
  } catch (error) {
    errorMessage.value = error.response ? error.response.data.message : error.message;
  }
};

// Make a test request
api.get('/test')
  .then(response => {
    console.log("🐒 ~ Test Request Response:", response.data);
  })
  .catch(error => {
    console.error("🐒 ~ Test Request Error:", error);
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
}

.form-group {
  margin-bottom: 15px;
}

form label {
  display: block;
  margin-bottom: 5px;
}

form input {
  width: 100%;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-sizing: border-box; /* Ensures the input stays within the form-container */
}

button {
  width: 100%;
  padding: 10px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

button:hover {
  background-color: #0056b3;
}

p {
  text-align: center;
  cursor: pointer;
  color: #007bff;
  margin-top: 10px;
}

p:hover {
  text-decoration: underline;
}

.error-message {
  margin-bottom: 10px;
  border-radius: 8px;
  color: #ff4a4a;
  padding: 3px 0;
  cursor: default;
}

.error-message:hover {
  text-decoration: none;
}

.error-container {
  height: 1.2em; /* Fixed height for the error message container */
  margin-top: 5px; /* Space between input and error message */
}
</style>