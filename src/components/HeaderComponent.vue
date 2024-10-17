<template>
  <div class="header">
    <header>
      <h1 class="header-account-name">{{ adAccountName }}</h1>
      <nav class="nav-bar">
        <div class="nav-links">
          <router-link to="/history" class="nav-link" active-class="active-link">History</router-link>
          <router-link to="/budget-tracker" class="nav-link" active-class="active-link">Budget Tracker</router-link>
        </div>
        <div class="nav-user-actions">
          <router-link to="/profile" class="user-link">Profile</router-link>
          <span class="separator">|</span>
          <!-- Updated v-if to use isLoggedInComputed -->
          <div v-if="isLoggedInComputed" class="user-link logout-link" @click="logout">Logout</div>
          <router-link v-else to="/auth" class="user-link">Login / Signup</router-link>
        </div>
      </nav>
    </header>
  </div>
</template>

<script setup>
import { ref, watchEffect, computed } from 'vue'; // Added 'computed' import
import { useRouter } from 'vue-router';
import api from '@/api';
import { useAuth } from '@/composables/auth';

const adAccountName = ref('Account Name');
const { isLoggedIn, setAuth, checkAuthStatus, user } = useAuth(); // Get the user object
const router = useRouter();

// Create a computed property for isLoggedIn to make it reactive
const isLoggedInComputed = computed(() => isLoggedIn.value); // Computed property for isLoggedIn

const logout = async () => {
  try {
    await api.post('/logout', {}, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
    localStorage.removeItem('token'); // Clear the token
    setAuth(false); // Update authentication status
    user.email = ''; // Reset the user data
    user.accountId = '';
    router.push('/auth'); // Redirect to auth page
  } catch (error) {
    console.error('Error during logout:', error);
  }
};

const fetchAdAccountName = async () => {
  const token = localStorage.getItem('token');
  try {
    const response = await api.get('/ad-account-name', {
      headers: { Authorization: `Bearer ${token}` },
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
/* Your existing styles remain the same */
.header {
  display: flex;
  flex-direction: column;
  padding: 5px 20px;
  border-radius: 8px;
  position: relative;
  padding: 15px;
  background-color: #F9F9F8;
  border-radius: 20px;
}

.header::before,
.header::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: 20px;
  pointer-events: none;
}

.header::before {
  border: 3px solid #BEBDBF;
  top: 5px;
  left: 5px;
  right: 5px;
  bottom: 5px;
}

.header::after {
  border: 3px solid #1C1B21;
}

.header-account-name {
  margin: 0;
  font-size: 1.5em;
  color: #1C1B21;
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
  top: 15px;
  right: 20px;
  display: flex;
}

.nav-link {
  padding: 10px 20px;
  border: 2px solid BEBDBF;
  border-radius: 5px;
  text-decoration: none;
  font-weight: bold;
  color: #1C1B21;
  background-color: #f9f9f9;
  border-radius: 20px;
}

.nav-link:hover {
  background-color: #e0e0e0;
}

.user-link {
  text-decoration: none;
  font-weight: bold;
  color: #1C1B21;
  font-size: 0.9em;
  cursor: pointer;
}

.user-link:hover {
  text-decoration: underline;
  color: #61bca8ff;
}

.separator {
  margin: 0 10px;
  font-size: 0.9em;
  color: #888;
  font-weight: bold;
}

.logout-link {
  cursor: pointer;
}

.active-link {
  border: 2px solid #61bca8ff;
  border-radius: 20px;
}
</style>