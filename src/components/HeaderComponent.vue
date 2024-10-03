<template>
  <div class="header">
    <header>
      <h1 class="header-account-name">{{ adAccountName }}</h1>
      <nav class="nav-bar">
        <div class="nav-links">
          <!-- <router-link to="/" class="nav-link" active-class="active-link">Home</router-link> -->
          <router-link to="/history" class="nav-link" active-class="active-link">History</router-link>
          <router-link to="/budget-tracker" class="nav-link" active-class="active-link">Budget Tracker</router-link>
        </div>
        <!-- Moved this div outside of nav-links and styled it differently -->
        <div class="nav-user-actions">
          <router-link to="/profile" class="user-link">Profile</router-link>
          <span class="separator">|</span>
          <div v-if="isLoggedIn" class="user-link logout-link" @click="logout">Logout</div>
          <router-link v-else to="/auth" class="user-link">Login / Signup</router-link>
        </div>
      </nav>
    </header>
  </div>
</template>

<script setup>
import { ref, watchEffect } from 'vue';
import { useRouter } from 'vue-router';
import api from '@/api';
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
    const response = await api.get('/ad-account-name', {
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
  padding: 5px 20px;
  border-radius: 8px;
  position: relative;
}

.header-account-name {
  margin: 0;
  font-size: 1.5em;
  color: #333;
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
  position: absolute;
  top: 10px;
  /* Align to the top right */
  right: 20px;
  display: flex;
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

.user-link {
  text-decoration: none;
  font-weight: bold;
  color: black;
  font-size: 0.9em;
  cursor: pointer;
}

.user-link:hover {
  text-decoration: underline;
  color: green;
}

.separator {
  margin: 0 10px;
  font-size: 0.9em;
  color: #888;
  font-weight: bold;
  /* Light gray color for the separator */
}

.logout-link {
  cursor: pointer;
}

.active-link {
  border: 2px solid green;
}
</style>