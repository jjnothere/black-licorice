<!-- BudgetPacing.vue -->
<template>
  <div class="content">
    <budget-tracker :metrics="metrics" :date-range="dateRange" :groupName="groupName" :groupBudget="groupBudget"
      @budget-updated="handleBudgetUpdated">
    </budget-tracker>
  </div>
</template>

<script setup>
import { watch } from 'vue';
import BudgetTracker from '../components/BudgetTracker.vue'; // Import the component

const props = defineProps({
  groupName: String,
  groupBudget: Number,
  metrics: Array,
  dateRange: Object
});

// Example usage of props
watch(() => props.groupName, (newVal) => {
  console.log('groupName updated:', newVal);
});
watch(() => props.groupBudget, (newVal) => {
  console.log('groupBudget updated:', newVal);
});

const handleBudgetUpdated = (newBudget) => {
  console.log('Budget updated in BudgetPacing:', newBudget);
  // Logic to update the charts with the new budget
};
</script>