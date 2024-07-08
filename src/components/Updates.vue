<template>
  <div id="updates">
    <TableComponent :items="items" @update-items="updateItems" />
  </div>
</template>

<script>
import TableComponent from '.@/TableComponent.vue';
import axios from 'axios';

export default {
  components: {
    TableComponent
  },
  data() {
    return {
      items: []
    };
  },
  async created() {
    try {
      const response = await axios.get('/api/hello');
      this.items = response.data.map(item => ({ ...item, newNote: '' })); // Initialize newNote for each item
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  },
  methods: {
    updateItems(updatedItems) {
      this.items = updatedItems.map(item => ({ ...item, newNote: '' })); // Initialize newNote for each item
    }
  }
}
</script>

<style>
</style>
