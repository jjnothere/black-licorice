<template>
  <div id="app">
    <button @click="fetchData">Fetch Data</button>
    <div v-if="data">
      <pre>{{ data }}</pre>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'App',
  data() {
    return {
      data: null,
    };
  },
  methods: {
    async fetchData() {
      const url = '/api/linkedin';

      try {
        const response = await axios.get(url);
        this.data = response.data;
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    },
  },
};
</script>

<style scoped>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
button {
  padding: 10px 20px;
  font-size: 16px;
}
pre {
  text-align: left;
  margin-top: 20px;
  background: #f5f5f5;
  padding: 10px;
  border-radius: 5px;
  border: 1px solid #ddd;
}
</style>