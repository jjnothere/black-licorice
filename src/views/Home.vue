<template>
    <div>
      <button @click="executeTask">Fetch Ad Campaigns</button>
      <div v-if="loading">Loading...</div>
      <div v-if="error">{{ error }}</div>
      <ul v-if="campaigns.length">
        <li v-for="(campaign, index) in campaigns" :key="index">
          {{ campaign.name }} - {{ campaign.status }}
        </li>
      </ul>
    </div>
  </template>
  
  <script>
  import axios from 'axios';
  
  export default {
    name: 'Home',
    data() {
      return {
        interval: 24 * 60 * 60 * 1000, // 24 hours
        campaigns: [],
        loading: false,
        error: ''
      };
    },
    mounted() {
      this.scheduleTask();
    },
    methods: {
      async executeTask() {
        const apiUrl = '/api/linkedin/ad-campaigns'; // Ensure the URL is correct
        this.loading = true;
        this.error = '';
  
        try {
          const response = await axios.get(apiUrl);
          console.log("🐒 ~ response:", response);
          this.campaigns = response.data.elements || []; // Adjust according to the actual structure of your API response
        } catch (error) {
          console.error('Error fetching data from server:', error);
          this.error = 'Failed to fetch ad campaigns.';
        } finally {
          this.loading = false;
        }
      },
      scheduleTask() {
        // Execute the task immediately upon mounting
        this.executeTask();
  
        // Schedule the task to run at the defined interval
        setInterval(this.executeTask, this.interval);
      }
    }
  };
  </script>
  
  <style scoped>
  button {
    margin: 20px;
    padding: 10px 20px;
    font-size: 16px;
  }
  
  ul {
    list-style-type: none;
    padding: 0;
  }
  
  li {
    padding: 10px 0;
    border-bottom: 1px solid #ccc;
  }
  </style>