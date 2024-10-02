<template>
  <div class="budget-tracker">
    <h4>Details</h4>
    <div class="budget-input">
      <label for="budget">
        <!-- Check if a specific group budget exists -->
        <template v-if="groupBudget && groupBudget !== 0">
          <!-- Displaying the budget statically if it exists -->
          <p class="campaign-group-budget">{{ groupName ? `${groupName} Budget: $${formattedBudget}` : `Budget:
            $${formattedBudget}` }}</p>
        </template>
        <template v-else>
          <!-- Allowing input for a default budget if no specific group budget is set -->
          Budget: $
          <input type="text" id="budget" v-model="formattedBudget" @input="validateBudgetInput" @change="saveBudget"
            placeholder="Enter Budget" />
        </template>
      </label>
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
  metrics: Array,
  dateRange: Object,
  groupName: String,
  groupBudget: Number
});

const budget = ref(0);
const formattedBudget = ref('0.00');
const selectedGroupName = ref('');
const campaignNames = ref({}); // Define campaignNames before using it

// Fetch the default budget from the server
const fetchDefaultBudget = async () => {
  try {
    const response = await api.get('/get-budget', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
    if (response.data && response.data.budget) {
      console.log("Fetched Default Budget: ", response.data.budget);
      return response.data.budget;
    } else {
      console.log("No Default Budget Set for User.");
      return 0;
    }
  } catch (error) {
    console.error('Error fetching default budget:', error);
    return 0;
  }
};

// Watcher to handle budget updates
watch(() => props.groupBudget, async (newBudget) => {
  if (newBudget !== undefined && newBudget !== null) {
    console.log(`New Group Budget: ${newBudget}`);
    budget.value = newBudget;
    formattedBudget.value = newBudget.toFixed(2);
  } else {
    console.log('No Group Budget Provided, Fetching Default Budget...');
    const defaultBudget = await fetchDefaultBudget();
    budget.value = defaultBudget;
    formattedBudget.value = defaultBudget.toFixed(2);
  }
}, { immediate: true });

onMounted(async () => {
  if (!props.groupBudget) {
    console.log('Component Mounted Without Group Budget, Fetching Default Budget...');
    const defaultBudget = await fetchDefaultBudget();
    budget.value = defaultBudget;
    formattedBudget.value = defaultBudget.toFixed(2);
  }
});
// Validate and update budget input
const validateBudgetInput = (event) => {
  let value = event.target.value.replace(/[^\d.]/g, ''); // Remove non-numeric characters
  const decimalIndex = value.indexOf('.');

  if (decimalIndex !== -1) {
    value = value.slice(0, decimalIndex + 1) + value.slice(decimalIndex).replace(/\./g, '');
  }

  if (decimalIndex !== -1 && value.length > decimalIndex + 3) {
    value = value.slice(0, decimalIndex + 3); // Limit to two decimal places
  }

  formattedBudget.value = value;
  budget.value = parseFloat(value) || 0;
};

// Watch for changes in the selected group name
watch(() => props.groupName, (newName) => {
  if (newName) {
    console.log(`Selected Group Name: ${newName}`);
    selectedGroupName.value = newName;
  }
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

// const budgetData = computed(() => {
//   const dailyBudget = budget.value / (labels.value.length || 1);
//   let cumulativeBudget = 0;
//   return labels.value.map(() => {
//     cumulativeBudget += dailyBudget;
//     return cumulativeBudget;
//   });
// });

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
  // Log the dateRange to verify it is passed correctly

  // Check if dateRange is properly defined, if not, return early
  if (!props.dateRange || !props.dateRange.start || !props.dateRange.end) {
    console.error("Date range is not properly defined");
    return; // Early return if dateRange is invalid
  }

  const actualLabels = labels.value;
  const actualSpendData = spendData.value;

  // Find the last date in the actual data (latest recorded date)
  const lastActualDate = new Date(actualLabels[actualLabels.length - 1]);
  const endDate = new Date(props.dateRange.end); // Ensure endDate is a Date object

  // Calculate the number of days left for projection
  const daysLeftForProjection = Math.round((endDate - lastActualDate) / (1000 * 3600 * 24)); // Convert milliseconds to days

  if (daysLeftForProjection <= 0) {
    console.log("No projection needed, end date is before the last actual date.");
    return;
  }

  // Calculate average daily spend
  const totalDaysOfData = actualLabels.length;
  const totalSpend = actualSpendData[actualSpendData.length - 1];
  const avgDailySpend = totalSpend / totalDaysOfData;

  // Generate projection data
  const projectedSpendData = [];
  const projectedLabels = [];
  let projectedSpend = totalSpend;

  // Start the projection from the next day after the last actual date
  for (let i = 1; i <= daysLeftForProjection; i++) {
    const projectedDate = new Date(lastActualDate);
    projectedDate.setDate(projectedDate.getDate() + i); // Increment date by 1 for each projection day

    // Format the date for the label in M/D/YYYY format (no leading zeros)
    const formattedDate = `${projectedDate.getMonth() + 1}/${projectedDate.getDate()}/${projectedDate.getFullYear()}`;
    projectedLabels.push(formattedDate);

    // Add projected spend
    projectedSpend += avgDailySpend;
    projectedSpendData.push(projectedSpend);
  }

  // Combine actual and projected data
  const allLabels = [...actualLabels, ...projectedLabels]; // Combine actual labels with projected labels
  // const allSpendData = [...actualSpendData]; // Keep actual spend data as is

  // Create the projected spend as a separate dataset starting from the next day
  const projectedSpendDataset = new Array(actualSpendData.length).fill(null).concat(projectedSpendData);

  // Calculate cumulative budget data for the chart
  const dailyBudget = budget.value / allLabels.length;
  const budgetLine = allLabels.map((_, index) => (index + 1) * dailyBudget);

  // Update chartData to include actual, projected, and budget data
  chartData.value = {
    labels: allLabels,
    datasets: [
      {
        label: 'Actual Spend',
        data: actualSpendData,
        borderColor: 'blue',
        fill: false
      },
      {
        label: 'Projected Spend',
        data: projectedSpendDataset, // Only show the projection from where the actual ends
        borderColor: 'red',
        borderDash: [5, 5],
        fill: false
      },
      {
        label: 'Budget Line',
        data: budgetLine,
        borderColor: 'green',
        borderDash: [10, 5], // Dashed green line for the budget
        fill: false
      }
    ]
  };

  await nextTick();
};

watch(budget, updateChart);
watch(() => props.metrics, updateChart);
watch(() => props.dateRange, updateChart); // Watch the date range for changes

onMounted(() => {
  fetchCampaignNames();
  fetchBudget(); // Fetch the budget from the database when the component is mounted
  updateChart();
  updatePieChart();
});


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

// const validateBudgetInput = (event) => {
//   let value = event.target.value;
//   value = value.replace(/[^\d.]/g, ''); // Remove non-numeric characters
//   const decimalIndex = value.indexOf('.');
//   if (decimalIndex !== -1) {
//     value = value.slice(0, decimalIndex + 1) + value.slice(decimalIndex).replace(/\./g, '');
//   }
//   if (decimalIndex !== -1 && value.length > decimalIndex + 3) {
//     value = value.slice(0, decimalIndex + 3); // Limit to 2 decimal places
//   }
//   formattedBudget.value = value;
//   budget.value = parseFloat(value) || 0;
// };

const saveBudget = async () => {
  try {
    await api.post('/save-budget', { budget: budget.value }, {
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

.campaign-group-budget {
  margin: 5.5px 0;
}
</style>