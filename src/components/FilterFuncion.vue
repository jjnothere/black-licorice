<!-- FilterFunction.vue -->
<script setup>
import { ref, onMounted, watch } from 'vue';
import axios from 'axios';

const emit = defineEmits(['update:selectedCampaigns']);

const campaignStatuses = ref([
  'active',
  'archived',
  'canceled',
  'draft',
  'paused',
  'pending_deletion',
  'removed'
]);

const campaigns = ref([]);
const campaignGroups = ref([]);
const selectedStatuses = ref([]);
const selectedCampaigns = ref([]);
const selectedGroups = ref([]);

const fetchCampaigns = async () => {
  try {
    const response = await axios.get('/api/linkedin/ad-campaigns');
    campaigns.value = response.data.elements.map(campaign => ({
      id: campaign.id,
      name: campaign.name
    }));
  } catch (error) {
    console.error('Error fetching campaigns:', error);
  }
};

const fetchCampaignGroups = async () => {
  try {
    const response = await axios.get('/api/linkedin/ad-campaign-groups');
    campaignGroups.value = response.data.elements.map(group => ({
      id: group.id,
      name: group.name
    }));
  } catch (error) {
    console.error('Error fetching campaign groups:', error);
  }
};

onMounted(() => {
  fetchCampaigns();
  fetchCampaignGroups();
});

watch(selectedCampaigns, (newSelectedCampaigns) => {
  emit('update:selectedCampaigns', newSelectedCampaigns);
});
</script>

<template>
  <div class="layout">
    <div class="filter-function">
      <div class="filter-header">
        <strong><h3>Filters:</h3></strong>
      </div>
      <div class="filter-content">
        <div class="filters">
          <div class="filter-group">
            <p><strong>Campaign Status</strong></p>
            <div v-for="status in campaignStatuses" :key="status">
              <input type="checkbox" :value="status" v-model="selectedStatuses" />
              <label>{{ status }}</label>
            </div>
          </div>

          <div class="filter-group">
            <p><strong>Campaigns</strong></p>
            <div v-for="campaign in campaigns" :key="campaign.id">
              <input type="checkbox" :value="campaign.id" v-model="selectedCampaigns" />
              <label>{{ campaign.name }}</label>
            </div>
          </div>
          
          <div class="filter-group">
            <p><strong>Campaign Groups</strong></p>
            <div v-for="group in campaignGroups" :key="group.id">
              <input type="checkbox" :value="group.id" v-model="selectedGroups" />
              <label>{{ group.name }}</label>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.layout {
  display: flex;
  margin-top: 10px;
}

.filter-function {
  width: 100%;
  border: 1px solid #ccc;
  padding: 10px;
  border-radius: 8px;
}

.filter-header {
  border-bottom: 1px solid orange;
  margin-bottom: 10px;
}

.filter-content {
  font-size: 0.9em;
  line-height: 1.5;
}

.filters {
  display: flex;
  flex-direction: column;
}

.filter-group {
  margin-bottom: 10px;
}
</style>