<!-- HeaderComponent.vue -->
<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import FilterFunction from '@/components/FilterFuncion.vue';
import Metrics from '@/components/Metrics.vue';

const adAccountName = ref('Account Name');
const selectedCampaigns = ref([]);

const updateSelectedCampaigns = (newSelectedCampaigns) => {
  selectedCampaigns.value = newSelectedCampaigns;
};

onMounted(async () => {
  try {
    const response = await axios.get('api/ad-account-name');
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
  <div class="layout">
    <div class="filter-function">
      <FilterFunction @update:selectedCampaigns="updateSelectedCampaigns" />
    </div>
    <div class="content">
      <Metrics :selectedCampaigns="selectedCampaigns" />
    </div>
  </div>
  <RouterView />
</template>

<style scoped>
.header {
  margin-bottom: 10px;
}

.nav-bar {
  display: flex;
  border: 1px solid #000;
  margin-top: 10px;
}

.nav-link {
  padding: 10px 20px;
  border: 1px solid #ccc;
  margin: 0 5px;
  text-decoration: none;
  font-weight: bold;
  color: black;
}

.nav-link:hover {
  background-color: #f0f0f0;
}

.active-link {
  border: 2px solid green;
}

.layout {
  display: flex;
  margin-top: 10px;
}

.content {
  width: 75%;
  padding: 10px;
}
</style>