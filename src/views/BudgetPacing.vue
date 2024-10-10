<!-- BudgetPacing.vue -->
<template>
  <div class="content">
    <budget-tracker :metrics="metrics" :dateRange="dateRange" :groupName="groupName" :groupBudget="budget" />
  </div>
</template>

<script setup>
import { defineProps } from 'vue';
import BudgetTracker from '../components/BudgetTracker.vue';


defineProps({
  groupName: String,
  budget: Number, // Use budget prop here
  metrics: Array,
  dateRange: Object
});

</script>