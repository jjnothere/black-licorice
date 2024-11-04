<template>
  <div>
    <div class="content">
      <div class="campaigns">
        <router-link to="/budget-tracker" class="nav-link">
          <h3>Budget Tracker</h3>
        </router-link>
        <h3>All Campaigns</h3>
        <ul v-if="campaigns.length">
          <li v-for="(campaign, index) in campaigns" :key="index">
            {{ campaign.name }}
          </li>
        </ul>
        <div v-if="loading" class="loading">Loading...</div>
        <div v-if="error" class="error">{{ error }}</div>
      </div>
      <div class="history">
        <HistoryChecker :selectedCampaigns="localSelectedCampaigns" :dateRange="dateRange" />
      </div>
    </div>
  </div>
</template>

<script>
import api from '@/api';
import HistoryChecker from '@/components/HistoryChecker.vue';

export default {
  name: 'HomePage',
  props: {
    metrics: Array,
    selectedCampaigns: Array,
    dateRange: Object
  },
  components: {
    HistoryChecker
  },
  data() {
    return {
      campaigns: [],
      localSelectedCampaigns: [], // Local property to handle the selected campaigns
      loading: false,
      error: ''
    };
  },
  async mounted() {
    await this.fetchCampaigns();
  },
  methods: {
    async fetchCampaigns() {
      const apiUrl = '/api/linkedin/ad-campaigns'; // Ensure the URL is correct
      this.loading = true;
      this.error = '';

      try {
        const response = await api.get(apiUrl, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
          withCredentials: true
        });
        this.campaigns = response.data.elements || []; // Adjust according to the actual structure of your API response
        this.localSelectedCampaigns = this.campaigns.map(campaign => campaign.id); // Select all campaigns
      } catch (error) {
        console.error('Error fetching data from server:', error);
        this.error = 'Failed to fetch ad campaigns.';
      } finally {
        this.loading = false;
      }
    }
  }
};
</script>

<style scoped>
.loading,
.error {
  margin: 20px 0;
}

.content {
  display: flex;
  /* justify-content: space-between; */
}

.campaigns {
  width: 35%;
  padding: 20px;
  background-color: white;
  border: 1px solid #ccc;
  border-radius: 8px;
  margin-right: 10px;
}

.history {
  width: 75%;
}

.history-pod {
  padding: 20px;
  background-color: white;
  border: 1px solid #ccc;
  border-radius: 8px;
  margin-top: 10px;
}

.active-link {
  border: 2px solid green;
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