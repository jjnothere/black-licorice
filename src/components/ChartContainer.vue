<template>
    <div class="combined-chart-container">
        <div class="line-chart-container">
            <line-chart :chart-data="lineChartData" :options="lineChartOptions"></line-chart>
        </div>
        <div class="pie-chart-container">
            <pie-chart :chart-data="pieChartData" :options="pieChartOptions"></pie-chart>
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
    budget: Number
});

// Fetch campaign names from the server
const fetchCampaignNames = async () => {
    try {
        const response = await api.get('/api/linkedin/ad-campaigns', {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
            withCredentials: true
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

const campaignNames = ref({});
const lineChartData = ref({
    labels: [],
    datasets: []
});
const pieChartData = ref({
    labels: [],
    datasets: []
});

const lineChartOptions = ref({
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
        datalabels: false
    }
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
                    return context[0].label.split(' ($')[0];
                },
                label: function (context) {
                    const value = parseFloat(context.raw).toFixed(2);
                    const percentage = context.label.split(' - ')[1];
                    return `$${value} (${percentage}`;
                }
            }
        },
        datalabels: false
    }
});

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

const distinctColors = [
    '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40', '#66FF66', '#FF6666', '#66B2FF', '#FF66B2',
    '#FF5733', '#33FF57', '#3357FF', '#FF33A6', '#33FFA6', '#A633FF', '#FFA633', '#33A6FF', '#FF33FF', '#33FF33',
    '#FFB533', '#33FFB5', '#FF33B5', '#B533FF', '#FF5733', '#A6FF33', '#FF33A6', '#33FFA6', '#33A633', '#FFA6FF'
];

const getCampaignName = (urn) => {
    const id = urn.split(':').pop();
    return campaignNames.value[id] || urn;
};

const updateLineChart = async () => {
    if (!props.dateRange || !props.dateRange.start || !props.dateRange.end) {
        console.error("Date range is not properly defined");
        return;
    }

    const actualLabels = labels.value;
    const actualSpendData = spendData.value;
    const lastActualDate = new Date(actualLabels[actualLabels.length - 1]);
    const endDate = new Date(props.dateRange.end);
    const daysLeftForProjection = Math.round((endDate - lastActualDate) / (1000 * 3600 * 24));

    if (daysLeftForProjection <= 0) {
        return;
    }

    const totalDaysOfData = actualLabels.length;
    const totalSpend = actualSpendData[actualSpendData.length - 1];
    const avgDailySpend = totalSpend / totalDaysOfData;

    const projectedSpendData = [];
    const projectedLabels = [];
    let projectedSpend = totalSpend;

    for (let i = 1; i <= daysLeftForProjection; i++) {
        const projectedDate = new Date(lastActualDate);
        projectedDate.setDate(projectedDate.getDate() + i);
        const formattedDate = `${projectedDate.getMonth() + 1}/${projectedDate.getDate()}/${projectedDate.getFullYear()}`;
        projectedLabels.push(formattedDate);
        projectedSpend += avgDailySpend;
        projectedSpendData.push(projectedSpend);
    }

    const allLabels = [...actualLabels, ...projectedLabels];
    const projectedSpendDataset = new Array(actualSpendData.length).fill(null).concat(projectedSpendData);
    const dailyBudget = props.budget / allLabels.length;
    const budgetLine = allLabels.map((_, index) => (index + 1) * dailyBudget);

    lineChartData.value = {
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
                data: projectedSpendDataset,
                borderColor: 'red',
                borderDash: [5, 5],
                fill: false
            },
            {
                label: 'Budget Line',
                data: budgetLine,
                borderColor: 'green',
                borderDash: [10, 5],
                fill: false
            }
        ]
    };

    await nextTick();
};

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

watch(() => props.metrics, () => {
    updateLineChart();
    updatePieChart();
});
watch(() => props.dateRange, updateLineChart);
watch(() => props.budget, updateLineChart);

onMounted(() => {
    fetchCampaignNames();
    updateLineChart();
    updatePieChart();
});
</script>

<style scoped>
.combined-chart-container {
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