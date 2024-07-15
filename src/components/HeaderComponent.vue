<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import axios from 'axios';

const adAccountName = ref('Account Name');

// Check the current route
const route = useRoute();

onMounted(async () => {
  try {
    const response = await axios.get('/api/ad-account-name');
    adAccountName.value = response.data.name;
  } catch (error) {
    console.error('Error fetching ad account name:', error);
  }
});
</script>

<template>
  <div class="header">
    <header>
      <h1>{{ adAccountName }}</h1>
      <nav class="nav-bar">
        <RouterLink to="/" class="nav-link" active-class="active-link">Home</RouterLink>
        <RouterLink to="/budget-tracker" class="nav-link" active-class="active-link">Budget Tracker</RouterLink>
        <RouterLink to="/history" class="nav-link" active-class="active-link">History</RouterLink>
      </nav>
    </header>
  </div>
</template>

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
  margin-top: 10px;
}

.nav-link {
  padding: 10px 20px;
  border: 1px solid #eee;
  border-radius: 5px;
  margin: 0 5px 0 0;
  text-decoration: none;
  font-weight: bold;
  color: black;
  background-color: #f9f9f9;
}

.nav-link:hover {
  background-color: #e0e0e0;
}

.active-link {
  border: 2px solid green;
}
</style>