<template>
    <div class="metrics">
        <!-- Container to align budget and date range in a single row -->
        <div class="metrics-row">
            <!-- Center Budget Details Section -->
            <div class="budget-details">
                <h3 class="metrics-header">Budget Details</h3>
                <div class="budget-input">
                    <label for="budget">
                        <!-- Check if a specific group budget exists -->
                        <template v-if="groupBudget && groupBudget !== 0">
                            <!-- Displaying the budget statically if it exists -->
                            <p class="campaign-group-budget">{{ groupName ? `${groupName} Budget: $${formattedBudget}` :
                                `Budget: $${formattedBudget}` }}</p>
                        </template>
                        <template v-else>
                            <!-- Allowing input for a default budget if no specific group budget is set -->
                            Budget: $
                            <input type="text" id="budget" v-model="formattedBudget" @input="validateBudgetInput"
                                @change="saveBudget" placeholder="Enter Budget" />
                        </template>
                    </label>
                </div>
            </div>

            <!-- Date Range Section on the right -->
            <div class="metrics-date">
                <div class="metrics-label">Select Month</div>
                <div class="datepicker-wrapper">
                    <MonthDatePicker class="monthpicker" @update-date-range="updateDateRange" />
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import api from '@/api';
import MonthDatePicker from '@/components/MonthDatePicker.vue';
import '@fortawesome/fontawesome-free/css/all.css'; // Import Font Awesome CSS
import { useAuth } from '@/composables/auth';

const props = defineProps({
    selectedCampaigns: Array,
    groupName: String,
    groupBudget: Number
});

const emit = defineEmits(['update:metrics', 'update-date-range', 'budget-updated']);
const metrics = ref([]);
const selectedStartDate = ref(new Date());
const selectedEndDate = ref(new Date());

const { isLoggedIn } = useAuth();

const spend = ref('0');
const impressions = ref('0');
const clicks = ref('0');
const conversions = ref('0');
const dateRange = ref('00/00/0000 - 00/00/0000');
const lastValidStartDate = ref(selectedStartDate.value);
const lastValidEndDate = ref(selectedEndDate.value);

const budget = ref(0);
const formattedBudget = ref('0.00');

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

        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('No authorization token found');
        }

        const response = await api.get('/linkedin', {
            params,
            headers: { Authorization: `Bearer ${token}` }
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

const updateDateRange = ({ start, end }) => {
    selectedStartDate.value = start;
    selectedEndDate.value = end;
    fetchMetrics(start, end, props.selectedCampaigns);
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
        emit('budget-updated', budget.value); // Emit budget-updated event
    } else {
        console.log('No Group Budget Provided, Fetching Default Budget...');
        const defaultBudget = await fetchDefaultBudget();
        budget.value = defaultBudget;
        formattedBudget.value = defaultBudget.toFixed(2);
        emit('budget-updated', budget.value); // Emit budget-updated event
    }
}, { immediate: true });

onMounted(async () => {
    if (!props.groupBudget) {
        console.log('Component Mounted Without Group Budget, Fetching Default Budget...');
        const defaultBudget = await fetchDefaultBudget();
        budget.value = defaultBudget;
        formattedBudget.value = defaultBudget.toFixed(2);
        emit('budget-updated', budget.value); // Emit budget-updated event
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

const saveBudget = async () => {
    try {
        await api.post('/save-budget', { budget: budget.value }, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        emit('budget-updated', budget.value); // Emit budget-updated event
    } catch (error) {
        console.error('Error saving budget:', error);
    }
};
</script>

<style scoped>
.metrics {
    display: flex;
    flex-direction: column;
    align-items: center;
    background-color: white;
    border: 1px solid #ccc;
    padding: 5px 20px;
    border-radius: 8px;
}

.metrics-row {
    display: flex;
    justify-content: center;
    /* Center the whole row */
    align-items: center;
    width: 100%;
    position: relative;
    /* To position the datepicker on the right */
}

.budget-details {
    text-align: center;
}

.metrics-header {
    margin: 5px 0;
    font-size: 1.5em;
    color: #333;
}

.budget-input {
    margin-top: 5px;
    text-align: center;
}

/* Keep the date range section aligned to the right */
.metrics-date {
    position: absolute;
    right: 0;
    /* Align to the right side of the container */
    text-align: right;
    padding-top: 25px;
}

.datepicker-wrapper {
    position: relative;
    width: 100%;
}

.calendar-icon {
    position: absolute;
    right: 10px;
    top: 50%;
    transform: translateY(-50%);
    color: #888;
    pointer-events: none;
}

.metrics-label {
    font-weight: bold;
    color: #666;
}

.metrics-numbers {
    color: #000;
}
</style>