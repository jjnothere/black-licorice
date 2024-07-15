<script setup>
import { ref, onMounted } from 'vue';
import TableComponent from '@/components/TableComponent.vue';
import HistoryChecker from '@/components/HistoryChecker.vue'; // Import the new component
import axios from 'axios';

const items = ref([]);

onMounted(async () => {
  try {
    const response = await axios.get('/api/hello');
    items.value = response.data;
  } catch (error) {
    console.error('Error fetching data:', error);
  }
});
</script>

<template>
   <div class="content">
  <!-- <TableComponent v-if="items.length" :items="items" @update-items="items = $event" />
  <div v-else>Loading...</div> -->
  <HistoryChecker /> <!-- Use the new component -->
</div>
</template>

<style scoped>
/* Add your styles here */
</style>