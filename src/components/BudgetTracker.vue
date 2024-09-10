<template>
  <div class="budget-tracker">
    <h4>Details</h4>
    <div class="budget-input">
      <label for="budget">Budget: $</label>
      <input type="text" id="budget" v-model="formattedBudget" @input="validateBudgetInput" @change="saveBudget" />
    </div>
    <div class="charts-container">
      <div class="line-chart-container">
        <line-chart :chart-data="chartData" :options="chartOptions"></line-chart>
      </div>
      <div class="pie-chart-container">
        <pie-chart :chart-data="pieChartData" :options="pieChartOptions"></pie-chart>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed, onMounted, nextTick } from 'vue';
import LineChart from './LineChart.vue';
import PieChart from './PieChart.vue';
import api from '@/api';

const props = defineProps({
  metrics: Array
});

const budget = ref(0); // User-defined budget
const formattedBudget = ref('0.00');
const campaignNames = ref({}); // Store campaign names

const labels = computed(() => props.metrics.map(metric => metric.dateRange.split(' - ')[0]).reverse());
const spendData = computed(() => {
  const data = [];
  let cumulativeSpend = 0;
  props.metrics.slice().reverse().forEach(metric => {
    cumulativeSpend += parseFloat(metric.spend.replace(/[$,]/g, '')) || 0;
    data.push(cumulativeSpend);
  });
  return data;
});

const budgetData = computed(() => {
  const dailyBudget = budget.value / (labels.value.length || 1);
  let cumulativeBudget = 0;
  return labels.value.map(() => {
    cumulativeBudget += dailyBudget;
    return cumulativeBudget;
  });
});

const chartData = ref({
  labels: [],
  datasets: []
});

const chartOptions = ref({
  responsive: true,
  scales: {
    x: {
      type: 'category',
      title: {
        display: true,
        text: 'Date'
      }
    },
    y: {
      title: {
        display: true,
        text: 'Amount'
      }
    }
  },
  plugins: {
    datalabels: false // Disable datalabels plugin for the line chart
  }
});

const updateChart = async () => {
  chartData.value = {
    labels: labels.value,
    datasets: [
      {
        label: 'Spend',
        data: spendData.value,
        borderColor: 'blue',
        fill: false
      },
      {
        label: 'Budget',
        data: budgetData.value,
        borderColor: 'green',
        borderDash: [5, 5],
        fill: false
      }
    ]
  };
  await nextTick();
};

watch(budget, updateChart);
watch(() => props.metrics, updateChart);

onMounted(() => {
  fetchCampaignNames();
  fetchBudget(); // Fetch the budget from the database when the component is mounted
  updateChart();
  updatePieChart();
});

// Fetch campaign names from the server
const fetchCampaignNames = async () => {
  try {
    const response = await api.get('/linkedin/ad-campaigns', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
    // Extract campaign ID and name from the response
    const campaigns = response.data.elements;
    campaigns.forEach(campaign => {
      campaignNames.value[campaign.id] = campaign.name;
    });
    updatePieChart(); // Ensure the pie chart is updated with the new campaign names
  } catch (error) {
    console.error('Error fetching campaign names:', error);
  }
};

// Fetch the budget from the server
const fetchBudget = async () => {
  try {
    const response = await api.get('/get-budget', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
    budget.value = response.data.budget;
    formattedBudget.value = budget.value.toFixed(2);
  } catch (error) {
    console.error('Error fetching budget:', error);
  }
};

const getCampaignName = (urn) => {
  const id = urn.split(':').pop(); // Extract the ID from the URN
  return campaignNames.value[id] || urn; // Return the name if found, otherwise the original URN
};

// Predefined distinct colors
const distinctColors = [
  '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40', '#66FF66', '#FF6666', '#66B2FF', '#FF66B2',
  '#FF5733', '#33FF57', '#3357FF', '#FF33A6', '#33FFA6', '#A633FF', '#FFA633', '#33A6FF', '#FF33FF', '#33FF33',
  '#FFB533', '#33FFB5', '#FF33B5', '#B533FF', '#FF5733', '#A6FF33', '#FF33A6', '#33FFA6', '#33A633', '#FFA6FF'
];

// Pie chart data and options
const pieChartData = ref({
  labels: [],
  datasets: []
});

const pieChartOptions = ref({
  responsive: true,
  plugins: {
    legend: {
      position: 'top',
      align: 'start',
      labels: {
        usePointStyle: true
      }
    },
    tooltip: {
      callbacks: {
        title: function (context) {
          return context[0].label.split(' ($')[0]; // Extract campaign name
        },
        label: function (context) {
          const value = parseFloat(context.raw).toFixed(2); // Format value to 2 decimal places
          const percentage = context.label.split(' - ')[1];
          return `$${value} (${percentage}`;
        }
      }
    },
    datalabels: false // Disable datalabels plugin for the pie chart
  }
});

const updatePieChart = async () => {
  const campaignSpend = props.metrics.reduce((acc, metric) => {
    const campaign = getCampaignName(metric.campaign);
    const spend = parseFloat(metric.spend.replace(/[$,]/g, '')) || 0;
    if (acc[campaign]) {
      acc[campaign] += spend;
    } else {
      acc[campaign] = spend;
    }
    return acc;
  }, {});

  const filteredLabels = Object.keys(campaignSpend).map(campaign => {
    const spend = campaignSpend[campaign];
    const total = Object.values(campaignSpend).reduce((sum, s) => sum + s, 0);
    const percentage = ((spend / total) * 100).toFixed(2);
    return `${campaign} ($${spend.toFixed(2)} - ${percentage}%)`;
  });
  const filteredData = Object.values(campaignSpend);

  pieChartData.value = {
    labels: filteredLabels,
    datasets: [
      {
        data: filteredData,
        backgroundColor: filteredLabels.map((_, index) => distinctColors[index % distinctColors.length])
      }
    ]
  };
  await nextTick();
};

watch(() => props.metrics, updatePieChart);

const validateBudgetInput = (event) => {
  let value = event.target.value;
  value = value.replace(/[^\d.]/g, ''); // Remove non-numeric characters
  const decimalIndex = value.indexOf('.');
  if (decimalIndex !== -1) {
    value = value.slice(0, decimalIndex + 1) + value.slice(decimalIndex).replace(/\./g, '');
  }
  if (decimalIndex !== -1 && value.length > decimalIndex + 3) {
    value = value.slice(0, decimalIndex + 3); // Limit to 2 decimal places
  }
  formattedBudget.value = value;
  budget.value = parseFloat(value) || 0;
};

const saveBudget = async () => {
  try {
    const response = await api.post('/save-budget', { budget: budget.value }, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
  } catch (error) {
    console.error('Error saving budget:', error);
  }
};
</script>

<style scoped>
.budget-tracker {
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: white;
  border: 1px solid #ccc;
  padding: 20px;
  border-radius: 8px;
}

.budget-input {
  margin-bottom: 20px;
}

.budget-input input {
  margin-left: 5px;
  width: 100px;
  padding: 5px;
}

.charts-container {
  display: flex;
  justify-content: center;
  width: 100%;
}

.line-chart-container {
  flex: 70%;
}

.pie-chart-container {
  flex: 30%;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th,
td {
  border: 1px solid #ccc;
  padding: 8px;
  text-align: left;
}

th {
  background-color: #f2f2f2;
}

td {
  background-color: #fff;
}
</style>