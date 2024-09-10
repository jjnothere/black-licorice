<template>
  <div class="layout">
    <div class="filter-function">
      <div class="filter-header">
        <strong>
          <h3>Filters:</h3>
        </strong>
      </div>
      <div class="filter-content">
        <div class="filters">
          <!-- Campaigns filter -->
          <div class="filter-group">
            <p><strong>Campaigns</strong></p>
            <div v-for="campaign in campaigns" :key="campaign.id">
              <input type="checkbox" :value="campaign.id" v-model="selectedCampaigns" />
              <label>{{ campaign.name }}</label>
            </div>
          </div>

          <!-- Campaign Groups filter with checkboxes and Trash icon -->
          <div class="filter-group">
            <p><strong>Campaign Groups</strong></p>
            <div v-for="group in campaignGroups" :key="group.id">
              <input type="checkbox" :checked="group.campaignIds.every(id => selectedCampaigns.includes(id))"
                @click="toggleGroupSelection(group)" />
              <label>{{ group.name }}</label>
              <!-- Trash Icon Button with Hover Effect -->
              <button class="icon-button" @click="deleteGroup(group.id)">
                <i class="fas fa-trash"></i>
              </button>
            </div>
          </div>

          <!-- Add Group Button styled like Add Note -->
          <button class="add-group-button" @click="openGroupModal">
            <i class="fas fa-plus"></i> Add Group
          </button>

          <!-- Modal for adding group -->
          <div v-if="isGroupModalOpen" class="modal">
            <div class="modal-content">
              <h3>Create New Group</h3>
              <input v-model="newGroupName" placeholder="Group Name" />
              <div v-for="campaign in campaigns" :key="campaign.id">
                <input type="checkbox" :value="campaign.id" v-model="newGroupCampaigns" />
                <label>{{ campaign.name }}</label>
              </div>
              <button @click="createGroup">Create Group</button>
              <button @click="closeGroupModal">Cancel</button>
            </div>
          </div>

        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import api from '@/api';

const emit = defineEmits(['update:selectedCampaigns']);

const campaigns = ref([]);
const selectedCampaigns = ref([]);
const campaignGroups = ref([]);
const newGroupName = ref('');
const newGroupCampaigns = ref([]);
const isGroupModalOpen = ref(false);

const fetchCampaigns = async () => {
  try {
    const response = await api.get('/linkedin/ad-campaigns', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
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
    const response = await api.get('/user-campaign-groups', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
    campaignGroups.value = response.data.groups || [];
  } catch (error) {
    console.error('Error fetching campaign groups:', error);
  }
};

onMounted(() => {
  fetchCampaigns();
  fetchCampaignGroups();
  const storedSelectedCampaigns = localStorage.getItem('selectedCampaigns');
  if (storedSelectedCampaigns) {
    selectedCampaigns.value = JSON.parse(storedSelectedCampaigns);
  }
});

watch(selectedCampaigns, (newSelectedCampaigns) => {
  localStorage.setItem('selectedCampaigns', JSON.stringify(newSelectedCampaigns));
  emit('update:selectedCampaigns', newSelectedCampaigns);
});

// Group Modal Functions
const openGroupModal = () => {
  isGroupModalOpen.value = true;
};

const closeGroupModal = () => {
  isGroupModalOpen.value = false;
  newGroupName.value = '';
  newGroupCampaigns.value = [];
};

const createGroup = async () => {
  if (newGroupName.value && newGroupCampaigns.value.length > 0) {
    const group = {
      id: Date.now(),
      name: newGroupName.value,
      campaignIds: newGroupCampaigns.value
    };

    // Save group to frontend state
    campaignGroups.value.push(group);

    // Save group to MongoDB
    try {
      await api.post('/save-campaign-groups', { group }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      console.log('Group saved to MongoDB');
    } catch (error) {
      console.error('Error saving group:', error);
    }

    closeGroupModal();
  } else {
    alert('Please provide a group name and select at least one campaign.');
  }
};

// Toggle group selection logic for checkboxes
const toggleGroupSelection = (group) => {
  const isSelected = group.campaignIds.every(id => selectedCampaigns.value.includes(id));

  if (isSelected) {
    // If the group is already selected, remove the group's campaigns from selectedCampaigns
    selectedCampaigns.value = selectedCampaigns.value.filter(id => !group.campaignIds.includes(id));
  } else {
    // If the group is not selected, add the group's campaigns to selectedCampaigns
    selectedCampaigns.value = [...new Set([...selectedCampaigns.value, ...group.campaignIds])]; // Ensures no duplicates
  }

  // Emit the updated selectedCampaigns and store them in local storage
  emit('update:selectedCampaigns', selectedCampaigns.value); // Emit the changes
  localStorage.setItem('selectedCampaigns', JSON.stringify(selectedCampaigns.value));
};

// Delete group function
const deleteGroup = async (groupId) => {
  // Remove group from frontend state
  campaignGroups.value = campaignGroups.value.filter(group => group.id !== groupId);

  // Remove group from MongoDB
  try {
    await api.post('/delete-campaign-group', { groupId }, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
    console.log('Group deleted from MongoDB');
  } catch (error) {
    console.error('Error deleting group:', error);
  }
};
</script>

<style scoped>
.layout {
  display: flex;
}

.filter-function {
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

.add-group-button {
  background: none;
  border: none;
  cursor: pointer;
  padding: 5px;
  color: #007bff;
}

.add-group-button:hover {
  background-color: #007bff;
  color: #fff;
  border-radius: 4px;
}

.modal {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: white;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.modal-content {
  display: flex;
  flex-direction: column;
}


.icon-button {
  background: none;
  border: none;
  cursor: pointer;
  padding: 5px;
  color: #007bff;
  margin-left: 2px;
}

.icon-button:hover {
  color: #fff;
  background-color: #007bff;
  border-radius: 4px;
}
</style>