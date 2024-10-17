<!-- MetricsComponent.vue -->
<template>
  <div class="metrics">
    <h3 class="metrics-header">Metrics</h3>
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
import { ref, onMounted, watch, watchEffect } from 'vue';
import api from '@/api';
import Datepicker from 'vue3-datepicker';
import '@fortawesome/fontawesome-free/css/all.css'; // Import Font Awesome CSS
import { useAuth } from '@/composables/auth';

const props = defineProps({
  selectedCampaigns: Array
});

const emit = defineEmits(['update:metrics', 'update-date-range']);
const metrics = ref([]);
const today = new Date();
// First day of the current month
const selectedStartDate = ref(new Date(today.getFullYear(), today.getMonth(), 1));
// Last day of the current month
const selectedEndDate = ref(new Date(today.getFullYear(), today.getMonth() + 1, 0));

// Emit the date range whenever it's updated
watch([selectedStartDate, selectedEndDate], () => {
  emit('update-date-range', {
    start: selectedStartDate.value,
    end: selectedEndDate.value
  });
});

const { isLoggedIn } = useAuth();

const spend = ref('0');
const impressions = ref('0');
const clicks = ref('0');
const conversions = ref('0');
const dateRange = ref('00/00/0000 - 00/00/0000');
const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
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
      params, // Contains the start, end, and campaigns
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } // Token in headers
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

    // Emit the new date range to the parent component
    emit('update-date-range', {
      start: newStartDate,
      end: newEndDate
    });
    emit('update-date-range', {
      start: selectedStartDate.value,
      end: selectedEndDate.value
    });
  }
});

// Watch for changes in isLoggedIn and fetch metrics if the user logs in
watch(isLoggedIn, (newIsLoggedIn) => {
  if (newIsLoggedIn) {
    fetchMetrics(selectedStartDate.value, selectedEndDate.value, props.selectedCampaigns);
  }
});
</script>

<style scoped>
@import '@fortawesome/fontawesome-free/css/all.css';

.metrics {
  display: flex;
  flex-direction: column;
  align-items: center;
  border-radius: 8px;
  position: relative;
  padding: 15px;
  background-color: #F9F9F8;
  border-radius: 20px;
}

.metrics::before,
.metrics::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: 20px;
  pointer-events: none;
}

.metrics::before {
  border: 3px solid #BEBDBF;
  /* Inner border color */
  top: 5px;
  /* Gap between the borders */
  left: 5px;
  right: 5px;
  bottom: 5px;
}

.metrics::after {
  border: 3px solid #1C1B21;
  /* Outer border color */
}

.metrics-header {
  margin: 0;
  font-size: 1.5em;
  color: #1C1B21;
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
  color: #61bca8ff;
  pointer-events: none;
}

.metrics-info {
  display: flex;
  width: 100%;
}

.metrics-pods {
  flex: 1;
  text-align: center;
  justify-content: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  border: 1px solid #61bca8ff;
  border-radius: 20px;
  background-color: #fff;
  margin: 5px;
}

.metrics-date {
  flex: 2;
  text-align: right;
}

.metrics-label {
  font-weight: bold;
  color: #1C1B21;
}

.metrics-numbers {
  font-size: 1.2em;
  color: #1C1B21;
  /* Add margin for better spacing between label and number */
}

.metrics-details table {
  width: 100%;
  border-collapse: collapse;
}
</style>