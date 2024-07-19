<template>
  <div>
    <HeaderComponent v-if="!isAuthRoute" />
    <div v-if="isAuthRoute" class="auth-layout">
      <router-view></router-view>
    </div>
    <div v-else class="layout">
      <div v-if="showFilterFunction" class="filter-function">
        <FilterFunction @update:selectedCampaigns="updateSelectedCampaigns" />
      </div>
      <div class="main-content">
        <Metrics :selectedCampaigns="selectedCampaigns" @update:metrics="updateMetrics" />
        <router-view :metrics="metrics" :selectedCampaigns="selectedCampaigns" :dateRange="dateRange" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { useRoute } from 'vue-router';
import HeaderComponent from '@/components/HeaderComponent.vue';
import FilterFunction from '@/components/FilterFunction.vue';
import Metrics from '@/components/Metrics.vue';

const selectedCampaigns = ref([]);
const metrics = ref([]);
const dateRange = ref({ start: new Date(), end: new Date() });

const route = useRoute();

const updateSelectedCampaigns = (newSelectedCampaigns) => {
  selectedCampaigns.value = newSelectedCampaigns;
};

const updateMetrics = (newMetrics) => {
  metrics.value = newMetrics.metrics;
  dateRange.value = { start: newMetrics.selectedStartDate, end: newMetrics.selectedEndDate };
};

const showFilterFunction = computed(() => {
  return route.path !== '/';
});

const isAuthRoute = computed(() => route.path === '/auth');

watch(route, () => {
  // To force a re-render when the route changes
  if (isAuthRoute.value) {
    selectedCampaigns.value = [];
    metrics.value = [];
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

.main-content > * {
  margin-bottom: 10px;
}
</style>