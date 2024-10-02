<template>
  <div class="budget-tracker">
    <h4>Details</h4>
    <BudgetInput :groupName="groupName" :groupBudget="groupBudget" />
    <ChartContainer :metrics="metrics" :dateRange="dateRange" :budget="budget" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import BudgetInput from './BudgetInput.vue';
import ChartContainer from './ChartContainer.vue';
import api from '@/api';

const props = defineProps({
  metrics: Array,
  dateRange: Object,
  groupName: String,
  groupBudget: Number
});

const budget = ref(0);

const fetchBudget = async () => {
  try {
    const response = await api.get('/get-budget', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
    budget.value = response.data.budget;
  } catch (error) {
    console.error('Error fetching budget:', error);
  }
};

onMounted(fetchBudget);
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
</style>