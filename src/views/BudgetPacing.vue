<!-- BudgetPacing.vue -->
<template>
  <div class="content">
    <budget-details :groupName="groupName" :groupBudget="groupBudget" @budget-updated="handleBudgetUpdated" />
    <budget-tracker :metrics="metrics" :dateRange="dateRange" :groupName="groupName" :groupBudget="updatedBudget" />
  </div>
</template>

<script setup>
import { ref } from 'vue';
import BudgetTracker from '../components/BudgetTracker.vue';
import BudgetDetails from '../components/BudgetDetails.vue';

const props = defineProps({
  groupName: String,
  groupBudget: Number,
  metrics: Array,
  dateRange: Object
});

const updatedBudget = ref(props.groupBudget || 0);

const handleBudgetUpdated = (newBudget) => {
  updatedBudget.value = newBudget;
  console.log('Updated budget in BudgetPacing:', newBudget);
};
</script>