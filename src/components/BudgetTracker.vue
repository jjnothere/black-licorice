<!-- BudgetTracker.vue -->
<template>
  <div class="budget-tracker">
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
  groupBudget: Number,
  budget: Number, // Use the budget prop here
  selectedAdAccountId: String, // Ensure this prop is available
});

const budgetRef = ref(0);
const formattedBudget = ref('0.00');
const selectedGroupName = ref('');
const campaignNames = ref({}); // Define campaignNames before using it


// Watcher to handle budget updates
watch(() => props.groupBudget, async (newBudget) => {
  if (newBudget !== undefined && newBudget !== null) {
    budgetRef.value = newBudget;
    formattedBudget.value = newBudget.toFixed(2);
  } else {
    // const defaultBudget = await fetchDefaultBudget();
    //   budgetRef.value = defaultBudget;
    //   formattedBudget.value = defaultBudget.toFixed(2);
  }
}, { immediate: true });


// Watch for changes in the selected group name
watch(() => props.groupName, (newName) => {
  if (newName) {
    selectedGroupName.value = newName;
  }
});



// // Fetch campaign names from the server

// Fetch campaign names from the server
const fetchCampaignNames = async () => {
  try {
    if (!props.selectedAdAccountId) {
      console.error('selectedAdAccountId is missing.');
      return;
    }
    console.log("🐒 ~ props.selectedAdAccountId:", props.selectedAdAccountId);

    const response = await api.get('/linkedin/ad-campaign-names', {
      params: { accountId: props.selectedAdAccountId },
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });

    console.log("🐒 ~ response:", response.data);

    const campaigns = response.data || []; // Default to an empty array if undefined
    if (campaigns.length === 0) {
      console.warn("No campaigns found in response data.");
    } else {
      campaigns.forEach(campaign => {
        campaignNames.value[campaign.id] = campaign.name;
      });
    }

    updatePieChart(); // Ensure the pie chart updates with the new campaign names
  } catch (error) {
    console.error('Error fetching campaign names:', error);
  }
};

const truncateName = (name, maxLength = 40) => {
  return name.length > maxLength ? `${name.slice(0, maxLength)}...` : name;
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
  const dailyBudget = budgetRef.value / allLabels.length;
  const budgetLine = allLabels.map((_, index) => (index + 1) * dailyBudget);

  // Update chartData to include actual, projected, and budget data
  chartData.value = {
    labels: allLabels,
    datasets: [
      {
        label: 'Actual Spend',
        data: actualSpendData,
        borderColor: '#F3D287',
        fill: false
      },
      {
        label: 'Projected Spend',
        data: projectedSpendDataset, // Only show the projection from where the actual ends
        borderColor: '#BEBDBF',
        borderDash: [5, 5],
        fill: false
      },
      {
        label: 'Budget Line',
        data: budgetLine,
        borderColor: '#61BCA8FF',
        borderDash: [10, 5], // Dashed green line for the budget
        fill: false
      }
    ]
  };

  await nextTick();
};

watch([budgetRef, () => props.metrics, () => props.dateRange], updateChart);

onMounted(() => {
  fetchCampaignNames();
  updateChart();
});


const getCampaignName = (urn) => {
  const id = urn.split(':').pop(); // Extract the ID from the URN
  return campaignNames.value[id] || urn; // Return the name if found, otherwise the original URN
};


const distinctColors = [
  '#D9B984', '#58A3A6', '#E0635E', '#B44A4D', '#585C6A', '#F4DB7D', '#E3A1A2', '#A4B887',
  '#40585B', '#F5C84E', '#A1A9C3', '#D8785B', '#3E5659', '#D6A0A1', '#4A6D6D', '#D4C46D',
  '#A85B6A', '#8A9B76', '#C7AE99', '#C4393F', '#9F6E5A', '#E7BA6D', '#AF4C47', '#8C4046',
  '#B1C1C4', '#5B7B6E', '#EBE8D5'
];

// Predefined distinct colors
// const distinctColors = [
//   '#eeddae', '#905e42', '#db323c', '#65a2a2', '#5b5131', '#e09637', '#4e6568', '#ee332a',
//   '#f6dbdc', '#8E44AD', '#C0392B', '#F1C40F', '#D35400', '#A29BFE', '#55E6C1', '#BDC3C7',
//   '#6C5CE7', '#FF7675', '#F8EFBA', '#81ECEC', '#FD79A8', '#74B9FF', '#636E72', '#FDCB6E',
//   '#D63031', '#00CEC9', '#E84393', '#0984E3', '#B2BEC3', '#FFEAA7'
// ];

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
          // Access tooltip text from pieChartData's tooltipText array
          const index = context[0].dataIndex;
          return pieChartData.value.tooltipText[index];
        },
        label: function (context) {
          const value = parseFloat(context.raw).toFixed(2); // Format value to 2 decimal places
          const percentage = context.label.split(' - ')[1].replace(/\)$/, ''); // Remove trailing parenthesis
          return `$${value} (${percentage})`;
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

  // Create labels and tooltip data
  const labels = [];
  const tooltipText = [];
  const filteredData = [];
  const totalSpend = Object.values(campaignSpend).reduce((sum, spend) => sum + spend, 0);

  Object.keys(campaignSpend).forEach((campaign) => {
    const truncatedCampaign = truncateName(campaign);
    const spend = campaignSpend[campaign];
    const percentage = ((spend / totalSpend) * 100).toFixed(2);
    labels.push(`${truncatedCampaign} ($${spend.toFixed(2)} - ${percentage}%)`);
    tooltipText.push(campaign); // Store the full campaign name for tooltip
    filteredData.push(spend);
  });

  // Set pie chart data and tooltip information
  pieChartData.value = {
    labels,
    datasets: [
      {
        data: filteredData,
        backgroundColor: labels.map((_, index) => distinctColors[index % distinctColors.length])
      }
    ],
    tooltipText, // Add tooltipText to the pieChartData to access in tooltip callback
  };

  await nextTick();
};

watch(() => props.metrics, updatePieChart);

// const saveBudget = async () => {
//   try {
//     await api.post('/save-budget', { budget: budget.value }, {
//       headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
//     });
//   } catch (error) {
//     console.error('Error saving budget:', error);
//   }
// };
</script>

<style scoped>
.budget-tracker {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  position: relative;
  padding: 15px;
  background-color: #F9F9F8;
  border-radius: 20px;
  color: #1C1B21;
}

.budget-tracker::before,
.budget-tracker::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: 20px;
  pointer-events: none;
}

.budget-tracker::before {
  border: 3px solid #BEBDBF;
  /* Inner border color */
  top: 5px;
  /* Gap between the borders */
  left: 5px;
  right: 5px;
  bottom: 5px;
}

.budget-tracker::after {
  border: 3px solid #1C1B21;
  /* Outer border color */
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
</style>