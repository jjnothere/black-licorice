<!-- App.vue -->
<template>
  <div class="full-content">
    <HeaderComponent v-if="!isAuthRoute" @update:selectedAdAccount="handleSelectedAdAccountChange" />
    <div v-if="isAuthRoute" class="auth-layout">
      <router-view></router-view>
    </div>
    <div v-else class="layout">
      <div v-if="showFilterFunction && !isProfilePage" class="filter-function">
        <FilterFunction v-if="showFilterFunction && !isProfilePage" :selectedAdAccountId="selectedAdAccountId"
          @update:selectedCampaigns="updateSelectedCampaigns" @update:budgetData="updateBudgetData" />
      </div>
      <div class="main-content">
        <Metrics v-if="isHistoryPage" :selectedCampaigns="selectedCampaigns" :selectedAdAccountId="selectedAdAccountId"
          @update:metrics="updateMetrics" />
        <BudgetDetails v-if="isBudgetTrackerPage" :selectedCampaigns="selectedCampaigns" :groupName="groupName"
          :groupBudget="groupBudget" :selectedAdAccountId="selectedAdAccountId" @budget-updated="handleBudgetUpdated"
          @update:metrics="updateMetrics" />
        <router-view :metrics="metrics" :selectedCampaigns="selectedCampaigns" :dateRange="dateRange"
          :groupName="groupName" :budget="budget" :selectedAdAccountId="selectedAdAccountId" />
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

const selectedAdAccountId = ref(localStorage.getItem('selectedAdAccountId') || null);

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
};

const showFilterFunction = computed(() => route.path !== '/');
const isAuthRoute = computed(() => route.path === '/auth');
const isProfilePage = computed(() => route.path === '/profile');
const isHistoryPage = computed(() => route.path === '/history');
const isBudgetTrackerPage = computed(() => route.path === '/budget-tracker');

const handleSelectedAdAccountChange = (accountId) => {
  selectedAdAccountId.value = accountId;
  localStorage.setItem('selectedAdAccountId', accountId); // Update local storage
};

// Watch for changes in selectedAdAccountId and refresh data when it changes
watch(selectedAdAccountId, (newAccountId) => {
  if (newAccountId) {
    // Reset data when the account changes
    selectedCampaigns.value = [];
    metrics.value = [];
    groupName.value = '';
    groupBudget.value = 0;
    budget.value = 0;

    // Notify child components to fetch new data
    updateMetrics({ metrics: [], selectedStartDate: dateRange.value.start, selectedEndDate: dateRange.value.end });
    updateBudgetData({ name: '', budget: 0 });
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