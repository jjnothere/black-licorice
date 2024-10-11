<!-- App.vue -->
<template>
  <div class="full-content">
    <HeaderComponent v-if="!isAuthRoute" />
    <div v-if="isAuthRoute" class="auth-layout">
      <router-view></router-view>
    </div>
    <div v-else class="layout">
      <div v-if="showFilterFunction && !isProfilePage" class="filter-function">
        <FilterFunction @update:selectedCampaigns="updateSelectedCampaigns" @update:budgetData="updateBudgetData" />
      </div>
      <div class="main-content">
        <Metrics v-if="isHistoryPage" :selectedCampaigns="selectedCampaigns" @update:metrics="updateMetrics" />
        <!-- Use BudgetDetails for budget updates -->
        <BudgetDetails v-if="isBudgetTrackerPage" :selectedCampaigns="selectedCampaigns" :groupName="groupName"
          :groupBudget="groupBudget" @budget-updated="handleBudgetUpdated" @update:metrics="updateMetrics" />
        <router-view :metrics="metrics" :selectedCampaigns="selectedCampaigns" :dateRange="dateRange"
          :groupName="groupName" :budget="budget" />
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
import BudgetDetails from '@/components/BudgetDetails.vue';

const selectedCampaigns = ref([]);
const metrics = ref([]);
const dateRange = ref({
  start: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
  end: new Date()
});

const groupName = ref('');
const groupBudget = ref(0);
const budget = ref(0);

const route = useRoute();

const updateSelectedCampaigns = (newSelectedCampaigns) => {
  selectedCampaigns.value = newSelectedCampaigns;
};

const updateBudgetData = ({ name, budget }) => {
  groupName.value = name;
  groupBudget.value = budget;
};

const updateMetrics = (newMetrics) => {
  metrics.value = newMetrics.metrics;
  dateRange.value = {
    start: newMetrics.selectedStartDate,
    end: newMetrics.selectedEndDate
  };
};

// Handle budget update and propagate the change to child components
const handleBudgetUpdated = (newBudget) => {
  budget.value = newBudget;
  console.log('Updated budget in App.vue:', newBudget);
};

const showFilterFunction = computed(() => route.path !== '/');
const isAuthRoute = computed(() => route.path === '/auth');
const isProfilePage = computed(() => route.path === '/profile');
const isHistoryPage = computed(() => route.path === '/history');
const isBudgetTrackerPage = computed(() => route.path === '/budget-tracker');

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