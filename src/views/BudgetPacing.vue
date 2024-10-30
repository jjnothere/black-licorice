<!-- BudgetPacing.vue -->
<template>
  <div class="content">
    <budget-tracker :metrics="metrics" :dateRange="dateRange" :groupName="groupName" :groupBudget="budget"
      :selectedAdAccountId="selectedAdAccountId" />
  </div>
</template>

<script setup>
import BudgetTracker from '../components/BudgetTracker.vue';


defineProps({
  groupName: String,
  budget: Number, // Use budget prop here
  metrics: Array,
  dateRange: Object,
  selectedAdAccountId: String
});

</script>