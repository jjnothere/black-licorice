<template>
  <div class="content">
    <budget-tracker :metrics="metrics" :date-range="dateRange"></budget-tracker>
  </div>
</template>

<script setup>
import BudgetTracker from '@/components/BudgetTracker.vue';

defineProps({
  metrics: Array,
  dateRange: Object // Receive the dateRange as a prop
});
</script>