<template>
  <div class="metrics">
    <h3 class="metrics-header">Metrics</h3>
    <!-- Metrics.vue -->
    <div class="metrics-info">
      <div class="metrics-pods">
        <div class="metrics-label">Spend</div>
        <div class="metrics-numbers">{{ spend }}</div>
      </div>
      <div class="metrics-pods">
        <div class="metrics-label">Impressions</div>
        <div class="metrics-numbers">{{ impressions }}</div>
      </div>
      <div class="metrics-pods">
        <div class="metrics-label">Clicks</div>
        <div class="metrics-numbers">{{ clicks }}</div>
      </div>
      <div class="metrics-pods">
        <div class="metrics-label">Conversions</div>
        <div class="metrics-numbers">{{ conversions }}</div>
      </div>
      <div class="metrics-date">
        <div class="metrics-label">Date Range</div>
        <div class="datepicker-wrapper">
          <Datepicker v-model="selectedStartDate" class="custom-datepicker" />
          <i class="fas fa-calendar-alt calendar-icon"></i>
        </div>
        <div class="datepicker-wrapper">
          <Datepicker v-model="selectedEndDate" class="custom-datepicker" />
          <i class="fas fa-calendar-alt calendar-icon"></i>
        </div>
        <div class="metrics-numbers">{{ dateRange }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import api from '@/api';
import Datepicker from 'vue3-datepicker';
import '@fortawesome/fontawesome-free/css/all.css'; // Import Font Awesome CSS
import { useAuth } from '@/composables/auth';

const { isLoggedIn } = useAuth();

const props = defineProps({
  selectedCampaigns: Array
});

const emit = defineEmits(['update:metrics', 'update-date-range']);
const metrics = ref([]);
const spend = ref('0');
const impressions = ref('0');
const clicks = ref('0');
const conversions = ref('0');
const dateRange = ref('00/00/0000 - 00/00/0000');

const today = new Date();
const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
const selectedStartDate = ref(startOfMonth);
const selectedEndDate = ref(today);
const lastValidStartDate = ref(startOfMonth);
const lastValidEndDate = ref(today);

const formatCurrency = (value) => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
};

const formatDate = (date) => {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};

const fetchMetrics = async (startDate, endDate, campaigns) => {
  if (!isLoggedIn.value) {
    return;
  }

  try {
    let params = {
      start: formatDate(startDate),
      end: formatDate(endDate)
    };

    if (campaigns && campaigns.length > 0) {
      const campaignList = campaigns.map(id => `urn%3Ali%3AsponsoredCampaign%3A${id}`).join(',');
      params.campaigns = `List(${campaignList})`;
    }

    const response = await api.get('/linkedin', {
      params,
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
    let data = response.data.elements;

    // Filter data to ensure it falls within the specified date range
    data = data.filter(item => {
      const itemStartDate = new Date(item.dateRange.start.year, item.dateRange.start.month - 1, item.dateRange.start.day);
      const itemEndDate = new Date(item.dateRange.end.year, item.dateRange.end.month - 1, item.dateRange.end.day);
      return (itemStartDate >= startDate && itemEndDate <= endDate);
    });

    let totalSpend = 0;
    let totalImpressions = 0;
    let totalClicks = 0;
    let totalConversions = 0;

    const sortedData = data.sort((a, b) => {
      const dateA = new Date(a.dateRange.start.year, a.dateRange.start.month - 1, a.dateRange.start.day);
      const dateB = new Date(b.dateRange.start.year, b.dateRange.start.month - 1, b.dateRange.start.day);
      return dateB - dateA; // Sort by newest to oldest
    });

    metrics.value = sortedData.map(item => {
      totalSpend += parseFloat(item.costInLocalCurrency) || 0;
      totalImpressions += item.impressions || 0;
      totalClicks += item.landingPageClicks || 0;
      totalConversions += item.externalWebsiteConversions || 0;

      return {
        id: `${item.pivotValues[0]}-${item.dateRange.start.month}-${item.dateRange.start.day}-${item.dateRange.start.year}`, // Unique key for each entry
        campaign: item.pivotValues[0], // Assuming pivotValues contains the campaign information
        spend: formatCurrency(parseFloat(item.costInLocalCurrency) || 0),
        impressions: item.impressions,
        clicks: item.landingPageClicks,
        conversions: item.externalWebsiteConversions,
        dateRange: `${item.dateRange.start.month}/${item.dateRange.start.day}/${item.dateRange.start.year} - ${item.dateRange.end.month}/${item.dateRange.end.day}/${item.dateRange.end.year}`
      };
    });

    spend.value = formatCurrency(totalSpend);
    impressions.value = totalImpressions;
    clicks.value = totalClicks;
    conversions.value = totalConversions;

    dateRange.value = `${startDate.getMonth() + 1}/${startDate.getDate()}/${startDate.getFullYear()} - ${endDate.getMonth() + 1}/${endDate.getDate()}/${endDate.getFullYear()}`;

    emit('update:metrics', {
      metrics: metrics.value,
      selectedStartDate: selectedStartDate.value,
      selectedEndDate: selectedEndDate.value,
    });

    emit('update-date-range', {
      start: selectedStartDate.value,
      end: selectedEndDate.value
    });
  } catch (error) {
    console.error('Error fetching metrics:', error);
  }
};

onMounted(() => {
  if (isLoggedIn.value) {
    fetchMetrics(selectedStartDate.value, selectedEndDate.value, props.selectedCampaigns);
  }
});

watch([selectedStartDate, selectedEndDate, () => props.selectedCampaigns], ([newStartDate, newEndDate, newCampaigns]) => {
  if (newStartDate > newEndDate) {
    alert('Start date cannot be later than end date. Please select a valid date range.');
    selectedStartDate.value = lastValidStartDate.value;
    selectedEndDate.value = lastValidEndDate.value;
  } else {
    lastValidStartDate.value = newStartDate;
    lastValidEndDate.value = newEndDate;
    if (isLoggedIn.value) {
      fetchMetrics(newStartDate, newEndDate, newCampaigns);
    }
    emit('update-date-range', {
      start: newStartDate,
      end: newEndDate
    });
  }
});
</script>

<style scoped>
@import '@fortawesome/fontawesome-free/css/all.css';

.metrics {
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: white;
  border: 1px solid #ccc;
  padding: 20px;
  border-radius: 8px;
}

.metrics-header {
  margin: 5px 0;
  font-size: 1.5em;
  color: #333;
}

.datepicker-wrapper {
  position: relative;
  width: 100%;
  margin-bottom: 10px;
}

.calendar-icon {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  color: #888;
  pointer-events: none;
}

.metrics-info {
  display: flex;
  justify-content: space-around;
  width: 100%;
  margin-bottom: 20px;
}

.metrics-pods {
  flex: 1;
  text-align: center;
  justify-content: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px; /* Increase padding for better spacing */
  border: 1px solid #eee;
  border-radius: 8px;
  background-color: #f9f9f9;
  margin: 5px;
}

.metrics-date {
  flex: 2;
  text-align: right;
}

.metrics-label {
  font-weight: bold;
  color: #666;
}

.metrics-numbers {
  font-size: 1.2em;
  color: #000;
  margin-top: 5px; /* Add margin for better spacing between label and number */
}

.metrics-details {
  margin-top: 20px;
  width: 100%;
}

.metrics-details table {
  width: 100%;
  border-collapse: collapse;
}

.metrics-details th, .metrics-details td {
  border: 1px solid #ccc;
  padding: 8px;
  text-align: left;
}

.metrics-details th {
  background-color: #f2f2f2;
}

.metrics-details td {
  background-color: #fff;
}
</style>