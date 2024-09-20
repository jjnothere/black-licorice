<template>
  <div>
    <HeaderComponent v-if="!isAuthRoute" />
    <div v-if="isAuthRoute" class="auth-layout">
      <router-view></router-view>
    </div>
    <div v-else class="layout">
      <div v-if="showFilterFunction && !isProfilePage" class="filter-function">
        <FilterFunction @update:selectedCampaigns="updateSelectedCampaigns" @update:budgetData="updateBudgetData" />
      </div>
      <div class="main-content">
        <!-- Pass the dateRange to the Metrics component -->
        <Metrics v-if="!isProfilePage" :selectedCampaigns="selectedCampaigns" @update:metrics="updateMetrics" />
        <!-- Pass metrics, dateRange, groupName, and groupBudget to child components via router-view -->
        <router-view :metrics="metrics" :selectedCampaigns="selectedCampaigns" :dateRange="dateRange"
          :groupName="groupName" :groupBudget="groupBudget" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { useRoute } from 'vue-router';
import HeaderComponent from '@/components/HeaderComponent.vue';
import FilterFunction from '@/components/FilterFunction.vue';
import Metrics from '@/components/MetricsComponent.vue';

const selectedCampaigns = ref([]);
const metrics = ref([]);
const dateRange = ref({
  start: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
  end: new Date()
});

// New group-related data
const groupName = ref('');
const groupBudget = ref(0);

const route = useRoute();

// Update the selected campaigns from the filter component
const updateSelectedCampaigns = (newSelectedCampaigns) => {
  selectedCampaigns.value = newSelectedCampaigns;
};

// Update the budget and group name from the FilterFunction component
const updateBudgetData = ({ name, budget }) => {
  groupName.value = name;
  groupBudget.value = budget;
};

// Update the metrics and date range from the Metrics component
const updateMetrics = (newMetrics) => {
  metrics.value = newMetrics.metrics;
  dateRange.value = {
    start: newMetrics.selectedStartDate,
    end: newMetrics.selectedEndDate
  };
};

const showFilterFunction = computed(() => route.path !== '/');
const isAuthRoute = computed(() => route.path === '/auth');
const isProfilePage = computed(() => route.path === '/profile');

// Watch for route changes and reset selected campaigns when on the home page
watch(route, (newRoute) => {
  if (newRoute.path === '/') {
    selectedCampaigns.value = [];
  }
});
</script>

<style scoped>
.auth-layout {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #f5f5f5;
}

.layout {
  display: flex;
  width: 100%;
  box-sizing: border-box;
}

.filter-function {
  margin: 10px 10px 0 0;
}

.main-content {
  flex: 3;
  display: flex;
  flex-direction: column;
  padding: 10px 0;
  gap: 0;
}

.main-content>* {
  margin-bottom: 10px;
}
</style>