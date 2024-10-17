<!-- HistoryPage.vue -->
<template>
  <div class="content">
    <HistoryChecker :metrics="metrics" :selectedCampaigns="selectedCampaigns" :dateRange="dateRange"
      :groupName="groupName" :budget="budget" />
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuth } from '@/composables/auth';
import HistoryChecker from '@/components/HistoryChecker.vue'; // Import the HistoryChecker component

const props = defineProps({
  dateRange: Object,
  metrics: Array,
  groupName: String,
  budget: Number,
  selectedCampaigns: Array
});

const dateRange = ref(props.dateRange);
const metrics = ref(props.metrics);

const router = useRouter();
const { setAuth, checkAuthStatus } = useAuth();

onMounted(() => {
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get('token');
  const startDate = urlParams.get('startDate');
  const endDate = urlParams.get('endDate');

  // Update the dateRange
  if (startDate && endDate) {
    dateRange.value = { start: startDate, end: endDate };
  }

  if (token) {
    localStorage.setItem('token', token);
    setAuth(true);
  } else {
    checkAuthStatus(router);
  }
});
</script>

<style scoped>
/* Add your styles here */
</style>