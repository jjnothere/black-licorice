<template>
  <div class="filter-function-page">
    <div class="header-search-container">
      <div class="filter-header">
        <strong>
          <h3 class="filters-header">Filters:</h3>
        </strong>
        <div class="rounded-line"></div>
      </div>
      <div class="filter-content">
        <!-- Search Bar -->
        <div class="search-bar">
          <input class="search-input" type="text" v-model="searchQuery" @input="filterCampaigns"
            placeholder="Search Campaigns..." />
          <button v-if="searchQuery" @click="clearSearch">X</button>
        </div>

        <!-- LinkedIn Campaign Groups -->
        <div class="scrollalbe-content">
          <div class="filter-group">
            <p class="filter-heading sticky-header"><strong>Campaign Groups</strong></p>
            <div v-for="group in filteredLinkedInCampaignGroups" :key="group.id" class="group-item">
              <input type="checkbox" :id="`select-group-${group.id}`" @change="selectAllCampaignsInGroup(group)"
                :checked="areAllCampaignsSelectedInGroup(group)" />
              <div @click="toggleGroupVisibility(group.id, 'filter')" class="group-label">
                <i :class="filterGroupVisibility[group.id] ? 'fas fa-chevron-down' : 'fas fa-chevron-up'"></i>
                <span class="campaign-names">{{ group.name }}</span>
              </div>

              <!-- <label :for="`select-group-${group.id}`">Select All</label> -->
              <div v-if="filterGroupVisibility[group.id]" class="campaigns-list">
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

          <!-- Campaign Groups filter with radio buttons and None option -->
          <div class="filter-group">
            <p class="filter-heading sticky-header"><strong>User Groups</strong></p>
            <button class="add-group-button" @click="openGroupModal">
              <i class="fas fa-plus"></i> Add User Group
            </button>
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
        </div>
        <!-- Add Group Modal -->
        <div v-if="isGroupModalOpen" class="modal" @click.self="closeGroupModal">
          <div class="modal-content">
            <h3 class="model-heading">Create New Group</h3>
            <div class="modal-inner-wrapper">
              <!-- Search Bar in Modal -->
              <div class="search-bar">
                <input class="search-input" type="text" v-model="modalSearchQuery" @input="filterModalCampaigns"
                  placeholder="Search Campaigns..." />
                <button v-if="modalSearchQuery" @click="clearModalSearch">X</button>
              </div>

              <input class="modal-text-input" v-model="newGroupName" placeholder="Group Name" />
              <input class="modal-text-input" type="text" id="new-group-budget" :value="formattedNewGroupBudget"
                @input="validateGroupBudgetInput" placeholder="Group Budget (Optional)" />

              <div class="modal-button-group">
                <button class="modal-button" @click="createGroup">Create Group</button>
                <button class="modal-button" @click="closeGroupModal">Cancel</button>
              </div>

              <!-- Campaign Groups in Modal with Select All -->
              <div v-for="group in filteredLinkedInCampaignGroupsModal" :key="group.id" class="group-item">
                <input type="checkbox" :id="`modal-select-group-${group.id}`"
                  @change="selectAllCampaignsInModalGroup(group)"
                  :checked="areAllCampaignsSelectedInModalGroup(group)" />
                <div @click="toggleGroupVisibility(group.id, 'modal')" class="group-label">
                  <i :class="modalGroupVisibility[group.id] ? 'fas fa-chevron-down' : 'fas fa-chevron-up'"></i>
                  <span class="campaign-names">{{ group.name }}</span>
                </div>

                <!-- Select All Checkbox in Modal -->
                <!-- <label :for="`modal-select-group-${group.id}`">Select All</label> -->

                <div v-if="modalGroupVisibility[group.id]" class="campaigns-list">
                  <div v-for="campaign in group.campaigns" :key="campaign.id">
                    <input type="checkbox" :value="campaign.id" v-model="newGroupCampaigns" />
                    <label>{{ campaign.name }}</label>
                  </div>
                </div>
                <div class="group-separator"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Edit Group Modal -->
        <div v-if="isEditGroupModalOpen" class="modal" @click.self="closeEditGroupModal">
          <div class="modal-content">
            <h3 class="model-heading">Edit Group</h3>
            <div class="modal-inner-wrapper">
              <!-- Search Bar in Modal -->
              <div class="search-bar">
                <input class="search-input" type="text" v-model="modalSearchQuery" @input="filterModalCampaigns"
                  placeholder="Search Campaigns..." />
                <button v-if="modalSearchQuery" @click="clearModalSearch">X</button>
              </div>

              <input class="modal-text-input" v-model="editGroupName" placeholder="Group Name" />
              <input class="modal-text-input" type="text" id="edit-group-budget" :value="formattedEditGroupBudget"
                @input="validateGroupBudgetInput" placeholder="Group Budget (Optional)" />

              <div class="modal-button-group">
                <button class="modal-button" @click="saveEditedGroup">Save Changes</button>
                <button class="modal-button" @click="closeEditGroupModal">Cancel</button>
              </div>

              <!-- Campaign Groups in Modal with Select All -->
              <div v-for="group in filteredLinkedInCampaignGroupsModal" :key="group.id" class="group-item">
                <input type="checkbox" :id="`edit-modal-select-group-${group.id}`"
                  @change="selectAllCampaignsInEditModalGroup(group)"
                  :checked="areAllCampaignsSelectedInEditModalGroup(group)" />
                <div @click="toggleGroupVisibility(group.id, 'modal')" class="group-label">
                  <i :class="modalGroupVisibility[group.id] ? 'fas fa-chevron-down' : 'fas fa-chevron-up'"></i>
                  <span class="campaign-names">{{ group.name }}</span>
                </div>

                <!-- Select All Checkbox in Modal -->

                <!-- <label :for="`edit-modal-select-group-${group.id}`">Select All</label> -->

                <div v-if="modalGroupVisibility[group.id]" class="campaigns-list">
                  <div v-for="campaign in group.campaigns" :key="campaign.id">
                    <input type="checkbox" :value="campaign.id" v-model="editGroupCampaigns" />
                    <label>{{ campaign.name }}</label>
                  </div>
                </div>
                <div class="group-separator"></div>
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
const linkedInCampaignGroups = ref([]);
const searchQuery = ref('');
const filteredLinkedInCampaignGroups = ref([]);
const filterGroupVisibility = ref({});
const modalGroupVisibility = ref({});

const modalSearchQuery = ref('');
const filteredLinkedInCampaignGroupsModal = ref([]);

// Method to filter campaigns based on search query in the main filter
const filterCampaigns = () => {
  if (!searchQuery.value) {
    filteredLinkedInCampaignGroups.value = linkedInCampaignGroups.value;
  } else {
    filteredLinkedInCampaignGroups.value = linkedInCampaignGroups.value.map(group => ({
      ...group,
      campaigns: group.campaigns.filter(campaign =>
        campaign.name.toLowerCase().includes(searchQuery.value.toLowerCase())
      ),
    })).filter(group => group.campaigns.length > 0);
  }
};

// Method to filter campaigns in the modals
const filterModalCampaigns = () => {
  if (!modalSearchQuery.value) {
    filteredLinkedInCampaignGroupsModal.value = linkedInCampaignGroups.value;
  } else {
    filteredLinkedInCampaignGroupsModal.value = linkedInCampaignGroups.value.map(group => ({
      ...group,
      campaigns: group.campaigns.filter(campaign =>
        campaign.name.toLowerCase().includes(modalSearchQuery.value.toLowerCase())
      ),
    })).filter(group => group.campaigns.length > 0);
  }
};

// Method to clear the search query in the main filter
const clearSearch = () => {
  searchQuery.value = '';
  filterCampaigns();
};

// Method to clear the search query in the modal
const clearModalSearch = () => {
  modalSearchQuery.value = '';
  filterModalCampaigns();
};

// Helper method to check if all campaigns in a group are selected
const areAllCampaignsSelectedInGroup = (group) => {
  const allCampaignIds = group.campaigns.map(campaign => campaign.id);
  return allCampaignIds.length > 0 && allCampaignIds.every(id => selectedCampaigns.value.includes(id));
};

// Method to select or deselect all campaigns in a group
const selectAllCampaignsInGroup = (group) => {
  const allCampaignIds = group.campaigns.map(campaign => campaign.id);
  if (areAllCampaignsSelectedInGroup(group)) {
    selectedCampaigns.value = selectedCampaigns.value.filter(id => !allCampaignIds.includes(id));
  } else {
    selectedCampaigns.value = [...new Set([...selectedCampaigns.value, ...allCampaignIds])];
  }
};

const toggleGroupVisibility = (groupId, origin) => {
  if (origin === 'filter') {
    // Toggle visibility for the filter section
    filterGroupVisibility.value[groupId] = !filterGroupVisibility.value[groupId];
  } else if (origin === 'modal') {
    // Toggle visibility for the modal section
    modalGroupVisibility.value[groupId] = !modalGroupVisibility.value[groupId];
  }
};
// Helper method to check if all campaigns in a group are selected in the modal
const areAllCampaignsSelectedInModalGroup = (group) => {
  const allCampaignIds = group.campaigns.map(campaign => campaign.id);
  return allCampaignIds.length > 0 && allCampaignIds.every(id => newGroupCampaigns.value.includes(id));
};

// Method to select or deselect all campaigns in a group in the modal
const selectAllCampaignsInModalGroup = (group) => {
  const allCampaignIds = group.campaigns.map(campaign => campaign.id);
  if (areAllCampaignsSelectedInModalGroup(group)) {
    newGroupCampaigns.value = newGroupCampaigns.value.filter(id => !allCampaignIds.includes(id));
  } else {
    newGroupCampaigns.value = [...new Set([...newGroupCampaigns.value, ...allCampaignIds])];
  }
};

// Helper method to check if all campaigns in a group are selected in the edit modal
const areAllCampaignsSelectedInEditModalGroup = (group) => {
  const allCampaignIds = group.campaigns.map(campaign => campaign.id);
  return allCampaignIds.length > 0 && allCampaignIds.every(id => editGroupCampaigns.value.includes(id));
};

// Method to select or deselect all campaigns in a group in the edit modal
const selectAllCampaignsInEditModalGroup = (group) => {
  const allCampaignIds = group.campaigns.map(campaign => campaign.id);
  if (areAllCampaignsSelectedInEditModalGroup(group)) {
    editGroupCampaigns.value = editGroupCampaigns.value.filter(id => !allCampaignIds.includes(id));
  } else {
    editGroupCampaigns.value = [...new Set([...editGroupCampaigns.value, ...allCampaignIds])];
  }
};

// Fetch LinkedIn campaign groups from the server
const fetchLinkedInCampaignGroups = async () => {
  try {
    const response = await api.get('/api/linkedin/linkedin-ad-campaign-groups', {
      params: { accountId: props.selectedAdAccountId },
      headers: { Authorization: `Bearer ${getTokenFromCookies()}` },
      withCredentials: true,
    });
    console.log("🐒 ~ accountId:", props.selectedAdAccountId)

    linkedInCampaignGroups.value = response.data.map(group => ({
      id: group.id,
      name: group.name,
      campaigns: group.campaigns.map(campaign => ({
        id: campaign.id,
        name: campaign.name,
      })),
      visible: false,
    }));

    filterCampaigns();
    filterModalCampaigns();
  } catch (error) {
    console.error('Error fetching LinkedIn campaign groups:', error);
  }
};

// Authentication setup
const { isLoggedIn, checkAuthStatus } = useAuth();
const props = defineProps(['selectedAdAccountId']);

// Helper function to get the token from cookies
const getTokenFromCookies = () => {
  const cookie = document.cookie.split('; ').find(row => row.startsWith('accessToken='));
  return cookie ? cookie.split('=')[1] : null;
};

// Fetch campaigns and campaign groups from the server
const fetchCampaignsAndGroups = async () => {
  const token = getTokenFromCookies();
  if (!token || !props.selectedAdAccountId) return;

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

// Watchers to react to changes in selectedAdAccountId
watch(() => props.selectedAdAccountId, async () => {
  await fetchCampaignsAndGroups();
  selectedCampaigns.value = [];
  selectedGroup.value = 'none';
  selectedGroupName.value = '';
  selectedGroupBudget.value = 0;

  emit('update:selectedCampaigns', []);
  emit('update:budgetData', { name: null, budget: null });
}, { immediate: true });

// Initialize on component mount
onMounted(() => {
  checkAuthStatus();
  if (isLoggedIn.value) {
    fetchCampaignsAndGroups();
    fetchLinkedInCampaignGroups();
  }
});

// Watch effect for logged-in status
watchEffect(() => {
  if (isLoggedIn.value) {
    fetchCampaignsAndGroups();
  }
});

// Function to save a new campaign group
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

// Watch selected campaigns and update local storage
watch(selectedCampaigns, (newSelectedCampaigns) => {
  localStorage.setItem('selectedCampaigns', JSON.stringify(newSelectedCampaigns));
  emit('update:selectedCampaigns', newSelectedCampaigns);
  fetchLinkedInCampaignGroups();
});

// Input validation for budget fields
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

// Functions to handle creating and editing groups
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

// Modal management functions
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
.filter-function-page {
  position: relative;
  padding: 15px;
  background-color: #F9F9F8;
  border-radius: 20px;
  height: calc(100vh - 180px);
  display: flex;
  flex-direction: column;
  min-width: 400px;
  overflow: hidden;
  /* Ensure content stays within the bordered lines */
  overflow-y: auto;
  /* Enable vertical scrolling */
}

.filter-function-page::before,
.filter-function-page::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: 20px;
  pointer-events: none;
}

.filter-function-page::before {
  border: 3px solid #BEBDBF;
  top: 5px;
  left: 5px;
  right: 5px;
  bottom: 5px;
}

.filter-function-page::after {
  border: 3px solid #1C1B21;
}

.filter-header {
  position: relative;
  padding-bottom: 10px;
  z-index: 2;
  /* Ensure the header stays above the content */
}

.rounded-line {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 5px;
  background-color: #F3D287;
  border-radius: 20px;
}

.filter-content {
  flex: 1;
  /* Make the filter content scrollable */
  margin-top: 15px;
  box-sizing: border-box;
  z-index: 1;
  overflow-y: auto;
  /* Enable vertical scrolling */
  overflow-x: hidden;
  /* Disable horizontal scrolling */
}

.filters {
  display: flex;
  flex-direction: column;
}

input[type="checkbox"],
input[type="radio"] {
  vertical-align: middle;
  margin-top: -4px;
  /* Align checkboxes and radio buttons with text */
}

.add-group-button {
  background: none;
  border: none;
  cursor: pointer;
  padding: 5px;
  color: #61bca8ff;
  width: fit-content;
  margin-bottom: 10px;
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
  padding: 5px 5px;
  margin-bottom: 10px;
}

.campaign-label {
  display: inline-block;
  max-width: 350px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  vertical-align: middle;
}

.campaign-label[data-tooltip]:hover::after {
  content: attr(data-tooltip);
  position: absolute;
  background-color: #333;
  color: #fff;
  padding: 5px 10px;
  border-radius: 4px;
  top: 100%;
  left: 0;
  transform: translateY(5px);
  z-index: 10;
  font-size: 0.8em;
  box-shadow: 0px 2px 10px rgba(0, 0, 0, 0.1);
}

.campaign-label[data-tooltip]:hover::before {
  content: '';
  position: absolute;
  border-style: solid;
  border-width: 5px 5px 0;
  border-color: #333 transparent transparent transparent;
  top: calc(100% + 5px);
  left: 10px;
  z-index: 10;
}

.filter-heading {
  font-size: 20px;
  text-transform: uppercase;
  margin: 5px 0;
}

.group-separator {
  height: 1px;
  background-color: #ccc;
  margin: 10px 0;
}

.group-label {
  display: inline-block;
  max-width: 350px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  vertical-align: middle;
}

.group-label i {
  margin-right: 3px;
  color: #61bca8ff;
}

.group-label:hover i {
  color: #3b9d8d;
}

.group-label[data-tooltip]:hover::after {
  content: attr(data-tooltip);
  position: absolute;
  background-color: #333;
  color: #fff;
  padding: 5px 10px;
  border-radius: 4px;
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


.search-bar {
  width: 50%;
  position: relative;
  z-index: 2;
}

.search-input {
  width: 100%;
  /* Make the input field take up the full width of the search bar */
  padding: 8px 0px 8px 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  outline: none;
}

.search-input:focus {
  border-color: #61bca8ff;
}

.search-bar button {
  position: absolute;
  top: 50%;
  right: -10px;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #61bca8ff;
  cursor: pointer;
  font-size: 16px;
  outline: none;
}

.search-bar button:hover {
  color: #3b9d8d;
}

.campaigns-list {
  margin-left: 15px;
}

.campaign-names {
  font-weight: bold;
}

.scrollalbe-content {
  max-height: calc(100vh - 250px);
  overflow-y: auto;
  overflow-x: hidden;
  box-sizing: border-box;
}

.sticky-header {
  position: -webkit-sticky;
  position: sticky;
  top: 0;
  background-color: #F9F9F8;
  z-index: 1;
  padding: 10px 0;
}
</style>