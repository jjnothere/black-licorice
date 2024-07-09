<template>
  <div class="budget-tracker">
    <h4>Details</h4>
    <div class="budget-input">
      <label for="budget">Budget: $</label>
      <input type="text" id="budget" v-model="formattedBudget" @input="validateBudgetInput" />
    </div>
    <line-chart :chart-data="chartData" :options="chartOptions"></line-chart>
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
import LineChart from './LineChart.vue'; // Ensure you have the correct path

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