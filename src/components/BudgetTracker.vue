<!-- BudgetTracker.vue -->
<template>
  <div class="budget-tracker">
    <h4>Details</h4>
    <div class="budget-input">
      <label for="budget">Budget: $</label>
      <input type="text" id="budget" v-model="formattedBudget" @input="validateBudgetInput" />
    </div>
    <div class="charts-container">
      <div class="line-chart-container">
        <line-chart :chart-data="chartData" :options="chartOptions"></line-chart>
      </div>
      <div class="pie-chart-container">
        Campagings with no cost will not show up here
        <pie-chart :chart-data="pieChartData" :options="pieChartOptions"></pie-chart>
      </div>
    </div>
    <table>
      <thead>
        <tr>
          <th>Campaign</th>
          <th>Spend</th>
          <th>Impressions</th>
          <th>Clicks</th>
          <th>Conversions</th>
          <th>Date Range</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="metric in metrics" :key="metric.id">
          <td>{{ metric.campaign }}</td>
          <td>{{ metric.spend }}</td>
          <td>{{ metric.impressions }}</td>
          <td>{{ metric.clicks }}</td>
          <td>{{ metric.conversions }}</td>
          <td>{{ metric.dateRange }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { ref, watch, computed, onMounted } from 'vue';
import LineChart from './LineChart.vue';
import PieChart from './PieChart.vue';

const props = defineProps({
  metrics: Array
});

const budget = ref(0); // User-defined budget
const formattedBudget = ref('0.00');

const labels = computed(() => props.metrics.map(metric => metric.dateRange.split(' - ')[0]));
const spendData = computed(() => {
  const data = [];
  let cumulativeSpend = 0;
  props.metrics.forEach(metric => {
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

const updateChart = () => {
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
};

watch(budget, updateChart);
watch(() => props.metrics, updateChart);

onMounted(updateChart);

// Predefined distinct colors
const distinctColors = [
  '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40', '#66FF66', '#FF6666', '#66B2FF', '#FF66B2'
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
      position: 'top'
    },
    tooltip: {
      callbacks: {
        label: function(context) {
          const total = context.dataset.data.reduce((sum, value) => sum + value, 0);
          const value = context.raw;
          const percentage = ((value / total) * 100).toFixed(2);
          return `${context.label}: $${value} (${percentage}%)`;
        }
      }
    },
    datalabels: {
      formatter: (value, context) => {
        const total = context.chart.data.datasets[0].data.reduce((sum, val) => sum + val, 0);
        const percentage = ((value / total) * 100).toFixed(2);
        return `${percentage}%`;
      },
      color: '#fff',
      backgroundColor: '#404040',
      borderRadius: 3,
      font: {
        weight: 'bold'
      }
    }
  }
});

const updatePieChart = () => {
  const campaignSpend = props.metrics.reduce((acc, metric) => {
    const campaign = metric.campaign;
    const spend = parseFloat(metric.spend.replace(/[$,]/g, '')) || 0;
    if (acc[campaign]) {
      acc[campaign] += spend;
    } else {
      acc[campaign] = spend;
    }
    return acc;
  }, {});

  const filteredCampaignSpend = Object.entries(campaignSpend).filter(([_, spend]) => spend > 0);
  console.log("🐒 ~ filteredCampaignSpend:", filteredCampaignSpend)
  const filteredLabels = filteredCampaignSpend.map(([campaign]) => campaign);
  console.log("🐒 ~ filteredLabels:", filteredLabels)
  const filteredData = filteredCampaignSpend.map(([_, spend]) => spend);
  console.log("🐒 ~ filteredData:", filteredData)

  pieChartData.value = {
    labels: filteredLabels,
    datasets: [
      {
        data: filteredData,
        backgroundColor: filteredLabels.map((_, index) => distinctColors[index % distinctColors.length])
      }
    ]
  };
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

th, td {
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