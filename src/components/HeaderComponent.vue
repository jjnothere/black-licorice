<template>
  <div class="header">
    <header>
      <h1>{{ adAccountName }}</h1>
      <nav class="nav-bar">
        <div class="nav-links">
          <router-link to="/" class="nav-link" active-class="active-link">Home</router-link>
          <router-link to="/budget-tracker" class="nav-link" active-class="active-link">Budget Tracker</router-link>
          <router-link to="/history" class="nav-link" active-class="active-link">History</router-link>
        </div>
        <div class="nav-user-actions">
          <router-link to="/profile" class="nav-link" active-class="active-link">Profile</router-link>
          <div v-if="isLoggedIn" class="nav-link logout-link" @click="logout">Logout</div>
          <router-link v-else to="/auth" class="nav-link auth-link">Login / Signup</router-link>
        </div>
      </nav>
    </header>
  </div>
</template>

<script setup>
import { ref, watchEffect } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';
import { useAuth } from '@/composables/auth';

const adAccountName = ref('Account Name');
const { isLoggedIn, setAuth, checkAuthStatus } = useAuth();
const router = useRouter();

const logout = () => {
  localStorage.removeItem('token');
  setAuth(false);
  router.push('/auth');
};

const fetchAdAccountName = async () => {
  try {
    const response = await axios.get('/api/ad-account-name', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    });
    adAccountName.value = response.data.name;
  } catch (error) {
    console.error('Error fetching ad account name:', error);
  }
};

watchEffect(() => {
  checkAuthStatus();
  if (isLoggedIn.value) {
    fetchAdAccountName();
  }
});
</script>

<style scoped>
.header {
  display: flex;
  flex-direction: column;
  background-color: white;
  border: 1px solid #ccc;
  padding: 20px;
  border-radius: 8px;
}

.nav-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 10px;
}

.nav-links {
  display: flex;
  gap: 10px;
}

.nav-user-actions {
  display: flex;
  gap: 10px;
}

.nav-link {
  padding: 10px 20px;
  border: 1px solid #eee;
  border-radius: 5px;
  text-decoration: none;
  font-weight: bold;
  color: black;
  background-color: #f9f9f9;
}

.nav-link:hover {
  background-color: #e0e0e0;
}

.auth-link {
  margin-left: auto;
}

.logout-link {
  cursor: pointer;
}

.active-link {
  border: 2px solid green;
}
</style>