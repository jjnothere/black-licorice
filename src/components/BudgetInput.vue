<template>
    <div class="budget-input">
        <label for="budget">
            <template v-if="groupBudget && groupBudget !== 0">
                <p class="campaign-group-budget">{{ groupName ? `${groupName} Budget: $${formattedBudget}` : `Budget:
                    $${formattedBudget}` }}</p>
            </template>
            <template v-else>
                Budget: $
                <input type="text" id="budget" v-model="formattedBudget" @input="validateBudgetInput"
                    @change="saveBudget" placeholder="Enter Budget" />
            </template>
        </label>
    </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue';
import api from '@/api';

const props = defineProps({
    groupName: String,
    groupBudget: Number
});

const budget = ref(0);
const formattedBudget = ref('0.00');

const fetchDefaultBudget = async () => {
    try {
        const response = await api.get('/get-budget', {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        if (response.data && response.data.budget) {
            return response.data.budget;
        } else {
            return 0;
        }
    } catch (error) {
        console.error('Error fetching default budget:', error);
        return 0;
    }
};

watch(() => props.groupBudget, async (newBudget) => {
    if (newBudget !== undefined && newBudget !== null) {
        budget.value = newBudget;
        formattedBudget.value = newBudget.toFixed(2);
    } else {
        const defaultBudget = await fetchDefaultBudget();
        budget.value = defaultBudget;
        formattedBudget.value = defaultBudget.toFixed(2);
    }
}, { immediate: true });

onMounted(async () => {
    if (!props.groupBudget) {
        const defaultBudget = await fetchDefaultBudget();
        budget.value = defaultBudget;
        formattedBudget.value = defaultBudget.toFixed(2);
    }
});

const validateBudgetInput = (event) => {
    let value = event.target.value.replace(/[^\d.]/g, '');
    const decimalIndex = value.indexOf('.');
    if (decimalIndex !== -1) {
        value = value.slice(0, decimalIndex + 1) + value.slice(decimalIndex).replace(/\./g, '');
    }
    if (decimalIndex !== -1 && value.length > decimalIndex + 3) {
        value = value.slice(0, decimalIndex + 3);
    }
    formattedBudget.value = value;
    budget.value = parseFloat(value) || 0;
};

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
.budget-input {
    margin-bottom: 20px;
}

.budget-input input {
    margin-left: 5px;
    width: 100px;
    padding: 5px;
}

.campaign-group-budget {
    margin: 5.5px 0;
}
</style>