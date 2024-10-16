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
            <!-- Default "None" option that clears all selections -->
            <div>
              <input type="radio" id="none" value="none" v-model="selectedGroup" @change="clearAllSelections()" />
              <label for="none">None</label>
            </div>

            <!-- Campaign groups with radio buttons -->
            <div v-for="group in campaignGroups" :key="group.id">
              <input type="radio" :value="group.id" v-model="selectedGroup" @change="selectGroup(group)" />
              <label>{{ group.name }}</label>
              <span v-if="group.budget"> (Budget: ${{ group.budget }}) </span>
              <!-- Edit and Delete Icons -->
              <button class="icon-button" @click="openEditGroupModal(group)">
                <i class="fas fa-edit"></i>
              </button>
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
              <h3 class="model-heading">Create New Group</h3>
              <input class="modal-text-input" v-model="newGroupName" placeholder="Group Name" />

              <!-- Budget input that allows only numeric input -->
              <input class="modal-text-input" type="text" id="new-group-budget" :value="formattedNewGroupBudget"
                @input="validateGroupBudgetInput" placeholder="Group Budget (Optional)" />

              <div class="modle-item" v-for="campaign in campaigns" :key="campaign.id">
                <input type="checkbox" :value="campaign.id" v-model="newGroupCampaigns" />
                <label>{{ campaign.name }}</label>
              </div>
              <button class="modal-button" @click="createGroup">Create Group</button>
              <button class="modal-button" @click="closeGroupModal">Cancel</button>
            </div>
          </div>

          <!-- Modal for editing group -->
          <div v-if="isEditGroupModalOpen" class="modal">
            <div class="modal-content">
              <h3 class="model-heading">Edit Group</h3>
              <input class="modal-text-input" v-model="editGroupName" placeholder="Group Name" />

              <!-- Budget input for editing group with validation -->
              <input class="modal-text-input" type="text" id="edit-group-budget" :value="formattedEditGroupBudget"
                @input="validateGroupBudgetInput" placeholder="Group Budget (Optional)" />

              <div class="modle-item" v-for="campaign in campaigns" :key="campaign.id">
                <input type="checkbox" :value="campaign.id" v-model="editGroupCampaigns" />
                <label>{{ campaign.name }}</label>
              </div>
              <button class="modal-button" @click="saveEditedGroup">Save Changes</button>
              <button class="modal-button" @click="closeEditGroupModal">Cancel</button>
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
const selectedGroupBudget = ref('');

// State for editing group
const isEditGroupModalOpen = ref(false);
const editGroupId = ref(null);
const editGroupName = ref('');
const editGroupBudget = ref(0); // Budget for the group being edited
const formattedEditGroupBudget = ref(''); // Formatted budget for display
const editGroupCampaigns = ref([]);

const { isLoggedIn, checkAuthStatus } = useAuth(); // Get the user object

// Fetch campaigns and groups
const fetchCampaigns = async () => {
  console.log("fetchCampaignsfetchCampaignsfetchCampaigns")
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

watchEffect(() => {
  checkAuthStatus();
  if (isLoggedIn.value) {
    fetchCampaigns();
    fetchCampaignGroups();
  }
});

// When component is mounted, fetch campaigns and groups
onMounted(() => {
  // fetchCampaigns();
  // fetchCampaignGroups();
  // const storedSelectedCampaigns = localStorage.getItem('selectedCampaigns');
  // if (storedSelectedCampaigns) {
  //   selectedCampaigns.value = JSON.parse(storedSelectedCampaigns);
  // }
});

watch(selectedCampaigns, (newSelectedCampaigns) => {
  localStorage.setItem('selectedCampaigns', JSON.stringify(newSelectedCampaigns));
  emit('update:selectedCampaigns', newSelectedCampaigns);
});

// Budget formatted variables for new and edited groups
const formattedNewGroupBudget = ref('');

// Function to validate numeric input for budget
const validateGroupBudgetInput = (event) => {
  let value = event.target.value.replace(/[^\d.]/g, ''); // Remove non-numeric characters
  const decimalIndex = value.indexOf('.');

  if (decimalIndex !== -1) {
    value = value.slice(0, decimalIndex + 1) + value.slice(decimalIndex).replace(/\./g, '');
  }

  if (decimalIndex !== -1 && value.length > decimalIndex + 3) {
    value = value.slice(0, decimalIndex + 3); // Limit to two decimal places
  }

  // Update the formatted budget for both new and edit group budgets
  if (event.target.id === 'new-group-budget') {
    formattedNewGroupBudget.value = value;
  } else if (event.target.id === 'edit-group-budget') {
    formattedEditGroupBudget.value = value;
    editGroupBudget.value = parseFloat(value) || 0;
  }
};

// Create group with budget
const createGroup = async () => {
  if (newGroupName.value && newGroupCampaigns.value.length > 0) {
    const group = {
      id: Date.now(),
      name: newGroupName.value,
      campaignIds: newGroupCampaigns.value,
      budget: parseFloat(formattedNewGroupBudget.value) || null // Convert to number
    };

    // Save group to frontend state
    campaignGroups.value.push(group);

    // Save group to backend (e.g., MongoDB)
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

// Open modal to edit group, loading the current budget and other data
const openEditGroupModal = (group) => {
  editGroupId.value = group.id;
  editGroupName.value = group.name;
  editGroupBudget.value = group.budget || 0; // Load existing budget
  formattedEditGroupBudget.value = group.budget ? group.budget.toFixed(2) : ''; // Format the budget
  editGroupCampaigns.value = group.campaignIds || [];
  isEditGroupModalOpen.value = true;
};

// Save changes to the edited group, including the budget
const saveEditedGroup = async () => {
  const group = {
    id: editGroupId.value,
    name: editGroupName.value,
    campaignIds: editGroupCampaigns.value,
    budget: parseFloat(formattedEditGroupBudget.value) || null // Save the updated budget
  };

  // Update group in frontend state
  const index = campaignGroups.value.findIndex(g => g.id === group.id);
  if (index !== -1) {
    campaignGroups.value[index] = group;
  }

  // Emit the updated budget and selected campaigns after saving
  emit('update:budgetData', { name: group.name, budget: group.budget });
  emit('update:selectedCampaigns', group.campaignIds);

  // Automatically select the updated group
  selectGroup(group);

  // Save updated group to backend (e.g., MongoDB)
  try {
    await api.post('/update-campaign-group', { group }, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
    console.log('Group updated in MongoDB');
  } catch (error) {
    console.error('Error updating group:', error);
  }

  closeEditGroupModal();
};

// Close the edit modal
const closeEditGroupModal = () => {
  isEditGroupModalOpen.value = false;
};

// Select a group and update campaigns and budget
const selectGroup = (group) => {
  selectedCampaigns.value = group.campaignIds;
  selectedGroup.value = group.id;
  selectedGroupName.value = group.name;
  selectedGroupBudget.value = group.budget;

  // Emit updated budget data
  emit('update:budgetData', { name: group.name, budget: group.budget });
};

const clearAllSelections = () => {
  console.log("clearAllSelections")
  selectedCampaigns.value = [];
  selectedGroup.value = 'none';
  selectedGroupName.value = ''; // Clear the group name
  selectedGroupBudget.value = 0; // Clear the budget
  emit('update:selectedCampaigns', []);
  emit('update:budgetData', { name: null, budget: null });
};

// Open and close modal functions
const openGroupModal = () => {
  isGroupModalOpen.value = true;
};

const closeGroupModal = () => {
  isGroupModalOpen.value = false;
  newGroupName.value = '';
  newGroupBudget.value = 0;
  newGroupCampaigns.value = [];
};

// Delete group function
const deleteGroup = async (groupId) => {
  campaignGroups.value = campaignGroups.value.filter(group => group.id !== groupId);

  // Remove group from backend (e.g., MongoDB)
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
/* Add styles for the modal and edit button */
.layout {
  display: flex;
  max-width: 250px;
}

.filter-function {
  position: relative;
  padding: 15px;
  background-color: #F9F9F8;
  border-radius: 20px;
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
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: #F9F9F8;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  width: 90%;
  max-width: 1000px;
  overflow-y: auto;
  border-radius: 20px;

}

.modal::before,
.modal::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: 20px;
  pointer-events: none;
}

.modal::before {
  border: 3px solid #BEBDBF;
  /* Inner border color */
  top: 5px;
  /* Gap between the borders */
  left: 5px;
  right: 5px;
  bottom: 5px;
}

.modal::after {
  border: 3px solid #1C1B21;
  /* Outer border color */
}







.modal-content {
  display: flex;
  flex-direction: column;
  padding: 20px;
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
}

.modle-item {
  margin-bottom: 10px;
  font-size: 1.2em;
}

.modal-button {
  padding: 10px 20px;
  border: 1px solid #eee;
  border-radius: 5px;
  text-decoration: none;
  font-weight: bold;
  color: black;
  background-color: #f9f9f9;
  cursor: pointer;
  margin-right: 10px;
  margin-bottom: 5px;
  max-width: 50%;
}

.modal-button:hover {
  background-color: #e0e0e0;
}

.modal-text-input {
  width: 50%;
  max-width: 50%;
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
</style>
