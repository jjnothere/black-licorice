<!-- BudgetPacing.vue -->
<template>
  <div class="content">
    <BudgetTracker :metrics="metrics" />
  </div>
</template>

<script setup>
import { defineProps } from 'vue';
import BudgetTracker from '@/components/BudgetTracker.vue';

const props = defineProps({
  metrics: Array
});
</script>

<style scoped>
.content {
  width: 100%;
}
</style>