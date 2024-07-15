<!-- App.vue -->
<<template>
  <HeaderComponent :adAccountName="adAccountName" />
  <div class="layout">
    <div v-if="showFilterFunction" class="filter-function">
      <FilterFunction @update:selectedCampaigns="updateSelectedCampaigns" />
    </div>
    <div class="main-content">
      <Metrics :selectedCampaigns="selectedCampaigns" @update:metrics="updateMetrics" />
      <RouterView :metrics="metrics" :selected-campaigns="selectedCampaigns" :date-range="dateRange" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { useRoute } from 'vue-router';
import axios from 'axios';
import HeaderComponent from '@/components/HeaderComponent.vue';
import FilterFunction from '@/components/FilterFunction.vue';
import Metrics from '@/components/Metrics.vue';

const adAccountName = ref('Account Name');
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

watch(dateRange, () => {
});

onMounted(async () => {
  try {
    const response = await axios.get('/api/ad-account-name');
    adAccountName.value = response.data.name;
  } catch (error) {
    console.error('Error fetching ad account name:', error);
  }
});
</script>

<style scoped>
.layout {
  display: flex;
  width: 100%;
  box-sizing: border-box;
}

.filter-function {
  margin-top: 10px;
}

.main-content {
  flex: 3;
  display: flex;
  flex-direction: column;
  padding: 10px 0 0 10px;
  gap: 0;
}

.main-content > * {
  margin-bottom: 10px;
}
</style>