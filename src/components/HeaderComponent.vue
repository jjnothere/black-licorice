<template>
  <div class="header">
    <header>
      <!-- Display selected ad account name in large font size -->
      <h1 class="selected-ad-account" @click="toggleDropdown">
        {{ selectedAdAccount?.name || 'Select Ad Account' }}
        <span class="caret">&#9662;</span> <!-- Caret for dropdown -->
      </h1>

      <!-- Dropdown for ad account selection -->
      <div v-if="showDropdown" class="dropdown">
        <ul>
          <li v-for="account in adAccounts" :key="account.id" @click="selectAdAccount(account)">
            {{ account.name }}
          </li>
        </ul>
      </div>

      <nav class="nav-bar">
        <div class="nav-links">
          <router-link to="/history" class="nav-link" active-class="active-link">History</router-link>
          <router-link to="/budget-tracker" class="nav-link" active-class="active-link">Budget Tracker</router-link>
        </div>
        <div class="nav-user-actions">
          <router-link to="/profile" class="user-link">Profile</router-link>
          <span class="separator">|</span>
          <div v-if="isLoggedInComputed" class="user-link logout-link" @click="logout">Logout</div>
          <router-link v-else to="/auth" class="user-link">Login / Signup</router-link>
        </div>
      </nav>
    </header>
  </div>
</template>

<script setup>
import { ref, computed, watchEffect, watch } from 'vue';
import { useRouter } from 'vue-router';
import api from '@/api';
import { useAuth } from '@/composables/auth';

const adAccounts = ref([]);
const selectedAdAccount = ref(null);
const showDropdown = ref(false);
const { isLoggedIn, setAuth, checkAuthStatus, user } = useAuth();
const router = useRouter();

const isLoggedInComputed = computed(() => isLoggedIn.value);

// Helper function to retrieve the token from cookies
const getTokenFromCookies = () => {
  const cookie = document.cookie.split('; ').find(row => row.startsWith('accessToken='));
  return cookie ? cookie.split('=')[1] : null;
};

const logout = async () => {
  try {
    const token = getTokenFromCookies(); // Ensure we have the token from cookies
    if (!token) throw new Error("Authorization token is missing");

    await api.post('/api/logout', {}, {
      headers: { Authorization: `Bearer ${token}` },
      withCredentials: true
    });

    // Clear local storage and other logout steps
    localStorage.removeItem('selectedAdAccountId');
    setAuth(false);
    user.email = '';
    user.accountId = '';
    router.push('/auth'); // Redirect to authentication page
  } catch (error) {
    console.error('Error during logout:', error);
  }
};

const setDefaultAdAccount = () => {
  if (adAccounts.value.length > 0) {
    selectedAdAccount.value = adAccounts.value[0];
    localStorage.setItem('selectedAdAccountId', selectedAdAccount.value.id);
    emit('update:selectedAdAccount', selectedAdAccount.value.id);

  } else {
    console.warn('No ad accounts available.');
  }
};

const fetchAdAccountNames = async () => {
  try {
    const response = await api.get('/api/ad-account-name', { withCredentials: true }); // No Authorization header needed
    adAccounts.value = response.data.adAccounts;

    if (!selectedAdAccount.value) {
      setDefaultAdAccount(); // Set the default ad account if none is selected
    }
  } catch (error) {
    console.error('Error fetching ad account names:', error);
  }
};

// Inside HeaderComponent.vue
const emit = defineEmits(['update:selectedAdAccount']);

const selectAdAccount = (account) => {
  selectedAdAccount.value = account;
  showDropdown.value = false;

  const accountId = account.id;
  localStorage.setItem('selectedAdAccountId', accountId); // Store the selected accountId
  emit('update:selectedAdAccount', accountId); // Emit the selected account ID
};

const handleClickOutside = (event) => {
  const dropdownElement = document.querySelector('.dropdown');
  if (dropdownElement && !dropdownElement.contains(event.target)) {
    showDropdown.value = false;
  }
};

const toggleDropdown = () => {
  showDropdown.value = !showDropdown.value;
  if (showDropdown.value) {
    setTimeout(() => document.addEventListener('click', handleClickOutside), 0);
  } else {
    document.removeEventListener('click', handleClickOutside);
  }
};

watchEffect(() => {
  if (!showDropdown.value) {
    document.removeEventListener('click', handleClickOutside);
  }
});

watchEffect(() => {
  checkAuthStatus();
  if (isLoggedIn.value) {
    fetchAdAccountNames();
  }
});

// Watch for changes in isLoggedIn and fetch metrics if the user logs in
watch(isLoggedIn, (newIsLoggedIn) => {
  if (newIsLoggedIn) {
    fetchAdAccountNames();
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

.selected-ad-account {
  font-size: 2em;
  color: #1C1B21;
  cursor: pointer;
  display: flex;
  align-items: center;
  margin: 0 0;
}

.caret {
  margin-left: 10px;
  font-size: 0.8em;
}

.dropdown {
  margin-top: 10px;
  background-color: #fff;
  border: 1px solid #ccc;
  border-radius: 5px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  position: absolute;
  z-index: 1000;
}

.dropdown ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.dropdown li {
  padding: 10px;
  cursor: pointer;
}

.dropdown li:hover {
  background-color: #f0f0f0;
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