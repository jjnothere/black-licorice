<template>
  <div class="layout">
    <div class="filter-function">
      <div class="filter-header">
        <strong>
          <h3 class="filters-header">Filters:</h3>
        </strong>
        <div class="rounded-line"></div>
      </div>
      <div class="filter-content">
        <div class="filters">
          <!-- Campaigns filter -->
          <div class="filter-group">
            <p class="filter-heading"><strong>Campaigns</strong></p>
            <div v-for="campaign in campaigns" :key="campaign.id">
              <input type="checkbox" :value="campaign.id" v-model="selectedCampaigns" />
              <Tooltip :text="campaign.name">
                <label class="campaign-label">{{ campaign.name }}</label>
              </Tooltip>
            </div>
          </div>

          <!-- Campaign Groups filter with radio buttons and None option -->
          <div class="filter-group">
            <p class="filter-heading"><strong>Campaign Groups</strong></p>
            <div>
              <input type="radio" id="none" value="none" v-model="selectedGroup" @change="clearAllSelections()" />
              <label for="none">None (Selects all campaigns)</label>
              <div class="group-separator"></div>
            </div>

            <div v-for="group in campaignGroups" :key="group.id" class="group-item">
              <input type="radio" :value="group.id" v-model="selectedGroup" @change="selectGroup(group)" />
              <Tooltip :text="group.name">
                <label class="group-label">{{ group.name }}</label>
              </Tooltip>
              <br />
              <span v-if="group.budget" class="budget-number">(Budget: ${{ group.budget }})</span>
              <button class="icon-button" @click="openEditGroupModal(group)">
                <i class="fas fa-edit"></i>
              </button>
              <button class="icon-button" @click="deleteGroup(group.id)">
                <i class="fas fa-trash"></i>
              </button>
              <div class="group-separator"></div>
            </div>
          </div>
          <!-- LinkedIn Campaign Groups -->
          <div class="filter-group">
            <p class="filter-heading"><strong>LinkedIn Campaign Groups</strong></p>
            <div v-for="group in linkedInCampaignGroups" :key="group.id" class="group-item">
              <div @click="toggleGroupVisibility(group.id)" class="group-label">
                <span>{{ group.name }}</span>
                <i :class="group.visible ? 'fas fa-caret-down' : 'fas fa-caret-right'"></i>
              </div>
              <input type="checkbox" :id="`select-group-${group.id}`" @change="selectAllCampaignsInGroup(group)"
                :checked="areAllCampaignsSelectedInGroup(group)" />
              <label :for="`select-group-${group.id}`">Select All</label>
              <div v-if="group.visible" class="campaigns-list">
                <div v-for="campaign in group.campaigns" :key="campaign.id">
                  <input type="checkbox" :value="campaign.id" v-model="selectedCampaigns" />
                  <Tooltip :text="campaign.name">
                    <label class="campaign-label">{{ campaign.name }}</label>
                  </Tooltip>
                </div>
              </div>
              <div class="group-separator"></div>
            </div>
          </div>
          <button class="add-group-button" @click="openGroupModal">
            <i class="fas fa-plus"></i> Add Group
          </button>

          <!-- Add Group Modal -->
          <div v-if="isGroupModalOpen" class="modal" @click.self="closeGroupModal">
            <div class="modal-content">
              <h3 class="model-heading">Create New Group</h3>
              <div class="modal-inner-wrapper">
                <input class="modal-text-input" v-model="newGroupName" placeholder="Group Name" />
                <input class="modal-text-input" type="text" id="new-group-budget" :value="formattedNewGroupBudget"
                  @input="validateGroupBudgetInput" placeholder="Group Budget (Optional)" />

                <div class="modal-button-group">
                  <button class="modal-button" @click="createGroup">Create Group</button>
                  <button class="modal-button" @click="closeGroupModal">Cancel</button>
                </div>

                <div class="modle-item" v-for="campaign in campaigns" :key="campaign.id">
                  <input type="checkbox" :value="campaign.id" v-model="newGroupCampaigns" />
                  <label>{{ campaign.name }}</label>
                </div>
              </div>
            </div>
          </div>

          <!-- Edit Group Modal -->
          <div v-if="isEditGroupModalOpen" class="modal" @click.self="closeEditGroupModal">
            <div class="modal-content">
              <h3 class="model-heading">Edit Group</h3>
              <div class="modal-inner-wrapper">
                <input class="modal-text-input" v-model="editGroupName" placeholder="Group Name" />
                <input class="modal-text-input" type="text" id="edit-group-budget" :value="formattedEditGroupBudget"
                  @input="validateGroupBudgetInput" placeholder="Group Budget (Optional)" />

                <div class="modal-button-group">
                  <button class="modal-button" @click="saveEditedGroup">Save Changes</button>
                  <button class="modal-button" @click="closeEditGroupModal">Cancel</button>
                </div>

                <div class="modle-item" v-for="campaign in campaigns" :key="campaign.id">
                  <input type="checkbox" :value="campaign.id" v-model="editGroupCampaigns" />
                  <label>{{ campaign.name }}</label>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref, onMounted, watch, watchEffect } from 'vue';
import api from '@/api';
import Tooltip from './TooltipComponent.vue';
import { useAuth } from '@/composables/auth';

const emit = defineEmits(['update:selectedCampaigns', 'update:budget', 'update:budgetData']);
const campaigns = ref([]);
const selectedCampaigns = ref([]);
const campaignGroups = ref([]);
const newGroupName = ref('');
const newGroupBudget = ref(0);
const newGroupCampaigns = ref([]);
const isGroupModalOpen = ref(false);
const selectedGroup = ref('none');
const selectedGroupName = ref('');
const selectedGroupBudget = ref(0);

const isEditGroupModalOpen = ref(false);
const editGroupId = ref(null);
const editGroupName = ref('');
const editGroupBudget = ref(0);
const formattedEditGroupBudget = ref('');
const editGroupCampaigns = ref([]);
const linkedInCampaignGroups = ref([]); // Array to hold LinkedIn campaign groups

// Method to select all campaigns in a group
const selectAllCampaignsInGroup = (group) => {
  const allCampaignIds = group.campaigns.map(campaign => campaign.id);
  if (areAllCampaignsSelectedInGroup(group)) {
    // If all campaigns are selected, remove them from the selected list
    selectedCampaigns.value = selectedCampaigns.value.filter(id => !allCampaignIds.includes(id));
  } else {
    // Otherwise, add all campaigns in the group to the selected list
    selectedCampaigns.value = [...new Set([...selectedCampaigns.value, ...allCampaignIds])];
  }
};

// Helper method to check if all campaigns in a group are selected
const areAllCampaignsSelectedInGroup = (group) => {
  const allCampaignIds = group.campaigns.map(campaign => campaign.id);
  return allCampaignIds.every(id => selectedCampaigns.value.includes(id));
};


const toggleGroupVisibility = (groupId) => {
  const group = linkedInCampaignGroups.value.find(group => group.id === groupId);
  if (group) {
    group.visible = !group.visible; // Toggle the visibility
  }
};

const fetchLinkedInCampaignGroups = async () => {
  try {
    // Fetch LinkedIn campaign groups and campaigns using the server-side API
    const response = await api.get('/api/linkedin/linkedin-ad-campaign-groups', {
      params: { accountId: props.selectedAdAccountId },
      headers: { Authorization: `Bearer ${getTokenFromCookies()}` },
      withCredentials: true,
    });

    // Update the data arrays with simplified objects
    linkedInCampaignGroups.value = response.data.map(group => ({
      id: group.id,
      name: group.name,
      campaigns: group.campaigns.map(campaign => ({
        id: campaign.id,
        name: campaign.name,
      })),
      visible: false, // Add visibility toggle property
    }));
    console.log("🐒 ~ LinkedIn Campaign Groups:", JSON.stringify(response.data));
  } catch (error) {
    console.error('Error fetching LinkedIn campaign groups:', error);
  }
};

const { isLoggedIn, checkAuthStatus } = useAuth();
const props = defineProps(['selectedAdAccountId']);

// Helper function to retrieve the token from cookies
const getTokenFromCookies = () => {
  const cookie = document.cookie.split('; ').find(row => row.startsWith('accessToken='));
  return cookie ? cookie.split('=')[1] : null;
};

const fetchCampaignsAndGroups = async () => {
  const token = getTokenFromCookies();
  if (!token || !props.selectedAdAccountId) {
    return;
  }

  try {
    const response = await api.get('/api/linkedin/ad-campaigns', {
      params: { accountIds: [props.selectedAdAccountId] },
      headers: { Authorization: `Bearer ${token}` },
      withCredentials: true
    });

    const adCampaignsData = response.data.adCampaigns[props.selectedAdAccountId] || {
      campaigns: [],
      campaignGroups: [],
    };

    campaigns.value = adCampaignsData.campaigns.map(campaign => ({
      id: campaign.id,
      name: campaign.name,
    }));
    campaignGroups.value = adCampaignsData.campaignGroups;
  } catch (error) {
    console.error('Error fetching campaigns and groups:', error);
  }
};

watch(() => props.selectedAdAccountId, async () => {
  await fetchCampaignsAndGroups();

  selectedCampaigns.value = [];
  selectedGroup.value = 'none';
  selectedGroupName.value = '';
  selectedGroupBudget.value = 0;

  emit('update:selectedCampaigns', []);
  emit('update:budgetData', { name: null, budget: null });
}, { immediate: true });

onMounted(() => {
  checkAuthStatus();
  if (isLoggedIn.value) {
    fetchCampaignsAndGroups();
    fetchLinkedInCampaignGroups();
  }
});

watchEffect(() => {
  if (isLoggedIn.value) {
    fetchCampaignsAndGroups();
  }
});

const saveCampaignGroup = async (group) => {
  const accountId = props.selectedAdAccountId;
  const token = getTokenFromCookies();
  if (!token) return;

  try {
    await api.post('/api/save-campaign-groups', { group, accountId }, {
      headers: { Authorization: `Bearer ${token}` },
      withCredentials: true
    });
  } catch (error) {
    console.error('Error saving campaign group:', error);
  }
};

watch(selectedCampaigns, (newSelectedCampaigns) => {
  localStorage.setItem('selectedCampaigns', JSON.stringify(newSelectedCampaigns));
  emit('update:selectedCampaigns', newSelectedCampaigns);
});

const formattedNewGroupBudget = ref('');

const validateGroupBudgetInput = (event) => {
  let value = event.target.value.replace(/[^\d.]/g, '');
  const decimalIndex = value.indexOf('.');

  if (decimalIndex !== -1) {
    value = value.slice(0, decimalIndex + 1) + value.slice(decimalIndex).replace(/\./g, '');
  }

  if (decimalIndex !== -1 && value.length > decimalIndex + 3) {
    value = value.slice(0, decimalIndex + 3);
  }

  if (event.target.id === 'new-group-budget') {
    formattedNewGroupBudget.value = value;
  } else if (event.target.id === 'edit-group-budget') {
    formattedEditGroupBudget.value = value;
    editGroupBudget.value = parseFloat(value) || 0;
  }
};

const createGroup = async () => {
  if (newGroupName.value && newGroupCampaigns.value.length > 0) {
    const group = {
      id: Date.now(),
      name: newGroupName.value,
      campaignIds: newGroupCampaigns.value,
      budget: parseFloat(formattedNewGroupBudget.value) || null
    };

    await saveCampaignGroup(group);
    campaignGroups.value.push(group);
    closeGroupModal();
  } else {
    alert('Please provide a group name and select at least one campaign.');
  }
};

const openEditGroupModal = (group) => {
  editGroupId.value = group.id;
  editGroupName.value = group.name;
  editGroupBudget.value = group.budget || 0;
  formattedEditGroupBudget.value = group.budget ? group.budget.toFixed(2) : '';
  editGroupCampaigns.value = group.campaignIds || [];
  isEditGroupModalOpen.value = true;
};

const saveEditedGroup = async () => {
  const group = {
    id: editGroupId.value,
    name: editGroupName.value,
    campaignIds: editGroupCampaigns.value,
    budget: parseFloat(formattedEditGroupBudget.value) || null
  };

  const index = campaignGroups.value.findIndex(g => g.id === group.id);
  if (index !== -1) {
    campaignGroups.value[index] = group;
  }

  emit('update:budgetData', { name: group.name, budget: group.budget });
  emit('update:selectedCampaigns', group.campaignIds);

  selectGroup(group);

  const token = getTokenFromCookies();
  if (!token) return;

  try {
    await api.post('/api/update-campaign-group', { group, accountId: props.selectedAdAccountId }, {
      headers: { Authorization: `Bearer ${token}` },
      withCredentials: true
    });
  } catch (error) {
    console.error('Error updating group:', error);
  }

  closeEditGroupModal();
};

const closeEditGroupModal = () => {
  isEditGroupModalOpen.value = false;
};

const selectGroup = (group) => {
  selectedCampaigns.value = group.campaignIds;
  selectedGroup.value = group.id;
  selectedGroupName.value = group.name;
  selectedGroupBudget.value = group.budget;

  emit('update:budgetData', { name: group.name, budget: group.budget });
};

const clearAllSelections = () => {
  selectedCampaigns.value = [];
  selectedGroup.value = 'none';
  selectedGroupName.value = '';
  selectedGroupBudget.value = 0;
  emit('update:selectedCampaigns', []);
  emit('update:budgetData', { name: null, budget: null });
};

const openGroupModal = () => {
  isGroupModalOpen.value = true;
};

const closeGroupModal = () => {
  isGroupModalOpen.value = false;
  newGroupName.value = '';
  newGroupBudget.value = 0;
  newGroupCampaigns.value = [];
};

const deleteGroup = async (groupId) => {
  campaignGroups.value = campaignGroups.value.filter(group => group.id !== groupId);
  const token = getTokenFromCookies();
  if (!token) return;

  try {
    await api.post('/api/delete-campaign-group', { groupId, accountId: props.selectedAdAccountId }, {
      headers: { Authorization: `Bearer ${token}` },
      withCredentials: true
    });
  } catch (error) {
    console.error('Error deleting group:', error);
  }
};
</script>

<style scoped>
.layout {
  display: flex;
  max-width: 250px;
  /* height: 558px; */
  /* Set the fixed height */
  /* overflow: hidden; */
  /* Prevent scrolling on the outer container */
  /* position: relative; */
  /* Ensure the inner container is positioned correctly */
}

.filter-function {
  position: relative;
  padding: 15px;
  background-color: #F9F9F8;
  border-radius: 20px;
  /* Ensure it takes the full height of the outer container */
  /* overflow: hidden; */
  /* Prevent scrolling on the outer container */
}

.filter-function::before,
.filter-function::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: 20px;
  pointer-events: none;
}

.filter-function::before {
  border: 3px solid #BEBDBF;
  /* Inner border color */
  top: 5px;
  /* Gap between the borders */
  left: 5px;
  right: 5px;
  bottom: 5px;
}

.filter-function::after {
  border: 3px solid #1C1B21;
  /* Outer border color */
}

/* .filter-content { */
/* max-height: calc(100% - 30px); */
/* Adjust based on padding and border */
/* overflow-y: auto; */
/* Add vertical scrollbar if content exceeds max height */
/* overflow-x: hidden; */
/* Prevent horizontal scrolling */
/* Add padding to avoid scrollbar overlap */
/* } */

/* CSS for the rounded line */
.filter-header {
  position: relative;
  padding-bottom: 10px;
  /* Add some padding for spacing */
}

.rounded-line {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 5px;
  background-color: #F3D287;
  border-radius: 20px;
  /* Make the line edges rounded */
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
  color: #61bca8ff;
}

/* Align checkboxes and radio buttons with text */
input[type="checkbox"] {
  vertical-align: middle;
  margin-top: -1px;
  /* Adjust this value if needed to better align */
}

input[type="radio"] {
  vertical-align: middle;
  margin-top: -4px;
  /* Adjust this value if needed to better align */
}

.add-group-button:hover {
  background-color: #61bca8ff;
  color: #fff;
  border-radius: 4px;
}

.modal {
  z-index: 10;
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
}

.modal-content {
  background-color: #F9F9F8;
  padding: 20px;
  width: 90%;
  max-width: 600px;
  border-radius: 20px;
  position: relative;
  /* Add borders here to keep them fixed */
}

.modal-content::before,
.modal-content::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: 20px;
  pointer-events: none;
}

.modal-content::before {
  border: 3px solid #BEBDBF;
  top: 5px;
  left: 5px;
  right: 5px;
  bottom: 5px;
}

.modal-content::after {
  border: 3px solid #1C1B21;
}

.modal-inner-wrapper {
  max-height: 60vh;
  overflow-y: auto;
  padding: 10px 0;
}

.icon-button {
  background: none;
  border: none;
  cursor: pointer;
  padding: 5px;
  color: #61bca8ff;
  margin-left: 2px;
}

.icon-button:hover {
  color: #fff;
  background-color: #61bca8ff;
  border-radius: 4px;
}

.filters-header {
  margin: 0;
  font-size: 25px;
}

.model-heading {
  margin: 0;
  padding-bottom: 5px;
  font-size: 2em;
}

.modle-item {
  margin-bottom: 10px;
  font-size: 1.2em;
}

.modal-button-group {
  display: flex;
  justify-content: flex-start;
  gap: 10px;
  margin-bottom: 10px;
}

.modal-button {
  padding: 10px 20px;
  border: 2px solid #61bca8;
  border-radius: 20px;
  text-decoration: none;
  font-weight: bold;
  color: black;
  background-color: #f9f9f9;
  cursor: pointer;
}

.modal-button:hover {
  background-color: #e0e0e0;
}

.modal-text-input {
  width: 50%;
  max-width: 50%;
  padding: 5px 5px;
  margin-bottom: 10px;
}

/* FilterFunction.vue */
.campaign-label {
  display: inline-block;
  max-width: 150px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  vertical-align: middle;
  position: relative;
}

/* Tooltip styling */
.campaign-label[data-tooltip]:hover::after {
  content: attr(data-tooltip);
  position: absolute;
  background-color: #333;
  color: #fff;
  padding: 5px 10px;
  border-radius: 4px;
  white-space: nowrap;
  top: 100%;
  /* Position below the label */
  left: 0;
  transform: translateY(5px);
  /* Add some spacing from the label */
  z-index: 10;
  font-size: 0.8em;
  box-shadow: 0px 2px 10px rgba(0, 0, 0, 0.1);
}

/* Tooltip arrow styling */
.campaign-label[data-tooltip]:hover::before {
  content: '';
  position: absolute;
  border-style: solid;
  border-width: 5px 5px 0;
  border-color: #333 transparent transparent transparent;
  top: calc(100% + 5px);
  /* Position the arrow below the label */
  left: 10px;
  z-index: 10;
}

.filter-heading {
  font-size: 20px;
  text-transform: uppercase;
  margin: 5px 0;
}

/* Add a gray line separator under each campaign group */
.group-separator {
  height: 1px;
  background-color: #ccc;
  margin: 10px 0;
}

/* Tooltip for long campaign group names */
.group-label {
  display: inline-block;
  max-width: 150px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  vertical-align: middle;
  position: relative;
}

.group-label[data-tooltip]:hover::after {
  content: attr(data-tooltip);
  position: absolute;
  background-color: #333;
  color: #fff;
  padding: 5px 10px;
  border-radius: 4px;
  white-space: nowrap;
  top: 100%;
  left: 0;
  transform: translateY(5px);
  z-index: 10;
  font-size: 0.8em;
  box-shadow: 0px 2px 10px rgba(0, 0, 0, 0.1);
}

.group-label[data-tooltip]:hover::before {
  content: '';
  position: absolute;
  border-style: solid;
  border-width: 5px 5px 0;
  border-color: #333 transparent transparent transparent;
  top: calc(100% + 5px);
  left: 10px;
  z-index: 10;
}

.budget-number {
  padding-left: 20px;
}
</style>
