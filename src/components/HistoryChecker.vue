<!-- HistoryChecker.vue -->
<template>
  <div class="history-checker">
    <router-link v-if="!isHistoryPage" to="/history" class="nav-link">
      <h3>Change History Log Journal</h3>
    </router-link>
    <br />
    <!-- <button v-if="!isHomePage" @click="checkForChanges">Check for Changes</button> -->

    <!-- Line chart section -->
    <div v-if="chartDataReady">
      <line-chart :chart-data="chartData" :options="chartOptions" @point-clicked="scrollToChange"></line-chart>
    </div>

    <!-- Table of differences -->
    <table v-if="filteredDifferences.length > 0">
      <thead>
        <tr>
          <th>Campaign Name</th>
          <th>Date</th>
          <th>Changes</th>
          <th>Notes</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(difference, index) in filteredDifferences" :key="difference._id" :id="`changeRow-${index}`">
          <td>{{ difference.campaign }}</td>
          <td>{{ difference.date }}</td>
          <td v-html="difference.changes"></td>
          <td>
            <div v-if="difference.addingNote" class="note-input">
              <input v-model="difference.newNote" placeholder="Add a new note"
                @keyup.enter="saveNewNotePrompt(difference._id)" @keyup.esc="cancelAddNotePrompt(difference._id)" />
              <button class="icon-button" @click="saveNewNotePrompt(difference._id)">
                <i class="fas fa-save"></i>
              </button>
              <button class="icon-button" @click="cancelAddNotePrompt(difference._id)">
                <i class="fas fa-times"></i>
              </button>
            </div>
            <button v-else class="icon-button" @click="enableAddNotePrompt(difference._id)">
              <i class="fas fa-plus"></i> Add Note
            </button>
            <div v-for="note in difference.notes.slice().reverse()" :key="note._id" class="note">
              <small class="note-timestamp">{{ formatTimestamp(note.timestamp) }}</small>
              <span v-if="!note.isEditing">{{ note.note }}</span>
              <input v-if="note.isEditing" v-model="note.newNote"
                @keyup.enter="saveNotePrompt(difference._id, note._id)"
                @keyup.esc="cancelEditMode(difference._id, note._id)"
                @blur="saveNotePrompt(difference._id, note._id)" />
              <div v-if="!note.isEditing" class="icon-buttons">
                <button class="icon-button" @click="enableEditMode(difference._id, note._id)">
                  <i class="fas fa-edit"></i>
                </button>
                <button class="icon-button" @click="deleteNotePrompt(difference._id, note._id)">
                  <i class="fas fa-trash"></i>
                </button>
              </div>
              <button v-if="note.isEditing" class="icon-button" @click="saveNotePrompt(difference._id, note._id)">
                <i class="fas fa-save"></i>
              </button>
              <div class="note-separator"></div>
            </div>
          </td>
        </tr>
      </tbody>
    </table>

    <div v-else>
      No changes found for the selected filters.
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import ObjectID from 'bson-objectid';
import api from '@/api';
import LineChart from './LineChart.vue'; // Importing the line chart component

const route = useRoute();

// const isHomePage = computed(() => route.path === '/');
const isHistoryPage = computed(() => route.path === '/history');

const props = defineProps({
  selectedCampaigns: Array,
  dateRange: Object,
  metrics: Array // Adding metrics prop for chart data
});

// Chart data and state variables
const chartData = ref({});
const chartOptions = ref({});
const chartDataReady = ref(false);

const fetchCurrentCampaigns = async () => {
  try {
    const response = await api.get('/get-current-campaigns', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
    const campaigns = response.data?.elements || [];
    campaignsMap.value = campaigns.reduce((map, campaign) => {
      map[campaign.id] = campaign.name;
      return map;
    }, {});
    return campaigns;
  } catch (error) {
    console.error('Error fetching current campaigns from database:', error);
    return [];
  }
};

const fetchLinkedInCampaigns = async () => {
  try {
    const response = await api.get('/linkedin/ad-campaigns', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
    return response.data.elements || [];
  } catch (error) {
    console.error('Error fetching LinkedIn campaigns:', error);
    return [];
  }
};

const addNewChange = (newChange) => {
  newChange._id = ObjectID().toHexString(); // Ensure new changes have unique IDs
  differences.value.push(newChange);
};

const findDifferences = (obj1, obj2) => {
  const diffs = {};
  for (const key in obj1) {
    if (key === 'changeAuditStamps') continue; // Exclude changeAuditStamps
    if (JSON.stringify(obj1[key]) !== JSON.stringify(obj2[key])) {
      diffs[key] = true; // Only keep the key
    }
  }
  return Object.keys(diffs).map(key => keyMapping[key] || key);
};

const checkForChanges = async () => {
  const currentCampaigns = await fetchCurrentCampaigns();
  const linkedInCampaigns = await fetchLinkedInCampaigns();

  const newDifferences = [];
  linkedInCampaigns.forEach((campaign2) => {
    const campaign1 = currentCampaigns.find((c) => c.id === campaign2.id);
    if (campaign1) {
      const changes = findDifferences(campaign1, campaign2);
      if (changes.length > 0) {
        const changesString = changes.map(change => {
          const color = colorMapping[change] || 'black'; // Default to black if color not found
          return `<span class="change-key" style="color:${color};"><b>${change}<b/></span>`;
        }).join('<br>');
        newDifferences.push({
          campaign: campaign2.name,
          date: new Date().toLocaleDateString(),
          changes: changesString,
          notes: campaign2.notes || [],
          addingNote: false,
          _id: campaign1._id // Ensure we have the correct MongoDB ID
        });
      }
    } else {
      addNewChange({
        campaign: campaign2.name,
        date: new Date().toLocaleDateString(),
        changes: 'New campaign added',
        notes: campaign2.notes || [],
        addingNote: false,
        _id: campaign2._id // Include _id if available
      });
    }
  });

  const uniqueDifferences = newDifferences.filter(newDiff =>
    !differences.value.some(existingDiff =>
      existingDiff.campaign === newDiff.campaign &&
      existingDiff.date === newDiff.date &&
      existingDiff.changes === newDiff.changes
    )
  );

  differences.value = [...uniqueDifferences, ...differences.value];

  try {
    await api.post('/save-campaigns', { campaigns: linkedInCampaigns }, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
    await api.post('/save-changes', { changes: uniqueDifferences }, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
  } catch (error) {
    console.error('Error saving campaigns and changes:', error);
  }
};

const scrollToChange = (dateLabel) => {
  console.log("🐒 ~ dateLabel:", dateLabel); // Log to verify the date label
  const matchingIndex = filteredDifferences.value.findIndex(diff => {
    return new Date(diff.date).toLocaleDateString() === new Date(dateLabel).toLocaleDateString();
  });

  if (matchingIndex !== -1) {
    const changeRow = document.getElementById(`changeRow-${matchingIndex}`);
    console.log("🐒 Scrolling to:", changeRow); // Log the row element
    if (changeRow) {
      changeRow.scrollIntoView({ behavior: 'smooth' });

      // Log to verify that class is added
      console.log("🐒 Adding 'flash-row' class to:", changeRow);

      // Add the flash-row class
      changeRow.classList.add('flash-row');

      // Remove the flash-row class after the animation completes (1s * 3 repeats)
      setTimeout(() => {
        console.log("🐒 Removing 'flash-row' class from:", changeRow);
        changeRow.classList.remove('flash-row');
      }, 3000); // Adjust timeout to match animation duration (3 repeats at 1s each)
    }
  }
};



const resetChartData = () => {
  chartData.value = {};
  chartDataReady.value = false;
};

onMounted(async () => {
  resetChartData();         // Reset chart data before loading
  await fetchAllChanges();  // Fetch changes
  await checkForChanges();  // Check for changes and update differences
  getAnalyticsData();       // Rebuild chart data with red dots
});

watch([() => props.selectedCampaigns, () => props.dateRange], async () => {
  await fetchAllChanges();
  await checkForChanges();
});

// Differences and campaigns
const differences = ref([]);
const campaignsMap = ref({});

// Color mappings for displaying changes
const colorMapping = {
  'Account': '#FF5733',            // Bright Red
  'Associated Entity': '#33C3FF',  // Light Blue
  'Audience Expansion': '#28A745', // Green
  'Campaign Group': '#AF7AC5',     // Purple
  'Cost Type': '#FFB533',          // Orange
  'Creative Selection': '#FF69B4', // Pink
  'Daily Budget': '#17A2B8',       // Cyan
  'Format': '#FFD700',             // Gold/Yellow
  'ID': '#FF33C9',                 // Magenta
  'Locale': '#8B4513',             // Saddle Brown
  'Name': '#32CD32',               // Lime Green
  'Objective Type': '#000080',     // Navy Blue
  'Offsite Delivery': '#808000',   // Olive Green
  'Offsite Preferences': '#20B2AA',// Light Sea Green
  'Optimization Target Type': '#800000', // Maroon
  'Pacing Strategy': '#FF4500',    // Orange Red
  'Run Schedule': '#4682B4',       // Steel Blue
  'Serving Statuses': '#1E90FF',   // Dodger Blue
  'Status': '#228B22',             // Forest Green
  'Story Delivery': '#DC143C',     // Crimson Red
  'Targeting Criteria': '#FF8C00', // Dark Orange
  'Test': '#00CED1',               // Dark Turquoise
  'Type': '#9932CC',               // Dark Orchid
  'Unit Cost': '#DAA520',          // Goldenrod
  'Version': '#FF6347'             // Tomato
};

// Key mappings for differences
const keyMapping = {
  account: 'Account',
  associatedEntity: 'Associated Entity',
  audienceExpansionEnabled: 'Audience Expansion',
  campaignGroup: 'Campaign Group',
  costType: 'Cost Type',
  creativeSelection: 'Creative Selection',
  dailyBudget: 'Daily Budget',
  format: 'Format',
  id: 'ID',
  locale: 'Locale',
  name: 'Name',
  objectiveType: 'Objective Type',
  offsiteDeliveryEnabled: 'Offsite Delivery',
  offsitePreferences: 'Offsite Preferences',
  optimizationTargetType: 'Optimization Target Type',
  pacingStrategy: 'Pacing Strategy',
  runSchedule: 'Run Schedule',
  servingStatuses: 'Serving Statuses',
  status: 'Status',
  storyDeliveryEnabled: 'Story Delivery',
  targetingCriteria: 'Targeting Criteria',
  test: 'Test',
  type: 'Campaign Type',
  unitCost: 'Unit Cost',
  version: 'Version'
};

// Function to fetch all changes
const fetchAllChanges = async () => {
  try {
    const response = await api.get('/get-all-changes', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
    differences.value = response.data.reverse().map(change => {
      if (!change._id) {
        change._id = ObjectID().toHexString();
      }
      return change;
    });
  } catch (error) {
    console.error('Error fetching all changes from the database:', error);
  }
};

// Computed property for filtered differences based on selected campaigns and date range
const filteredDifferences = computed(() => {
  if (!props.dateRange || !props.dateRange.start || !props.dateRange.end) {
    console.error("Date range is not properly defined", props.dateRange);
    return differences.value;
  }

  return differences.value.filter(diff => {
    const diffDate = new Date(diff.date);
    const isWithinDateRange = diffDate >= new Date(props.dateRange.start) && diffDate <= new Date(props.dateRange.end);
    const selectedCampaignNames = props.selectedCampaigns.map(id => campaignsMap.value[id]);
    const isSelectedCampaign = props.selectedCampaigns.length === 0 || selectedCampaignNames.includes(diff.campaign);
    return isWithinDateRange && isSelectedCampaign;
  });
});

// Watch and initialize functions
onMounted(async () => {
  await fetchAllChanges();
  getAnalyticsData();
});

watch([() => props.selectedCampaigns, () => props.dateRange], async () => {
  await fetchAllChanges();
  getAnalyticsData(); // Update chart data if selected campaigns or date range change
});

// Function to process metrics data and update the chart
const getAnalyticsData = () => {
  if (props.metrics && props.metrics.length) {
    const aggregatedData = props.metrics.reduce((acc, item) => {
      const itemId = item.id;
      const idParts = itemId.split('-');
      if (idParts.length === 4) {
        const dateKey = `${idParts[1]}/${idParts[2]}/${idParts[3]}`; // Date in MM/DD/YYYY format

        if (!acc[dateKey]) {
          acc[dateKey] = {
            conversions: 0,
            clicks: 0,
            impressions: 0,
            spend: 0,
            hasChanges: false // Initialize hasChanges to false
          };
        }

        const spendValue = parseFloat(item.spend.replace(/[^0-9.-]+/g, '')) || 0;
        acc[dateKey].conversions += item.conversions || 0;
        acc[dateKey].clicks += item.clicks || 0;
        acc[dateKey].impressions += item.impressions || 0;
        acc[dateKey].spend += spendValue;

        // Check if the date has changes
        if (filteredDifferences.value.some(diff => new Date(diff.date).toLocaleDateString() === dateKey)) {
          acc[dateKey].hasChanges = true; // Mark if changes exist for this date
        }
      }
      return acc;
    }, {});

    // Prepare chart data (reverse the labels for reverse x-axis)
    const labels = Object.keys(aggregatedData).reverse(); // Reverse the order of the labels
    const externalWebsiteConversions = labels.map(date => aggregatedData[date].conversions);
    const landingPageClicks = labels.map(date => aggregatedData[date].clicks);
    const impressions = labels.map(date => aggregatedData[date].impressions);
    const costInLocalCurrency = labels.map(date => aggregatedData[date].spend);

    // Define point styling for dates with changes
    const pointBackgroundColors = labels.map(date => aggregatedData[date].hasChanges ? 'red' : 'black'); // Red points indicate changes
    const pointBorderColors = labels.map(date => aggregatedData[date].hasChanges ? 'darkred' : 'black');

    // Define point radius: larger points for those with changes
    const pointRadius = labels.map(date => aggregatedData[date].hasChanges ? 4 : 3); // Bigger points (8) for changes, normal points (4) for others

    // Set up chart data and options
    chartData.value = {
      labels,
      datasets: [
        {
          label: 'Conversions',
          data: externalWebsiteConversions,
          borderColor: 'red',
          fill: false,
          pointBackgroundColor: pointBackgroundColors, // Highlight points with changes
          pointBorderColor: pointBorderColors,
          pointRadius: pointRadius, // Make red points bigger
        },
        {
          label: 'Clicks',
          data: landingPageClicks,
          borderColor: 'blue',
          fill: false,
          pointBackgroundColor: pointBackgroundColors,
          pointBorderColor: pointBorderColors,
          pointRadius: pointRadius,
        },
        {
          label: 'Impressions',
          data: impressions,
          borderColor: 'green',
          fill: false,
          pointBackgroundColor: pointBackgroundColors,
          pointBorderColor: pointBorderColors,
          pointRadius: pointRadius,
        },
        {
          label: 'Spend',
          data: costInLocalCurrency,
          borderColor: 'purple',
          fill: false,
          pointBackgroundColor: pointBackgroundColors, // Highlight points with changes
          pointBorderColor: pointBorderColors,
          pointRadius: pointRadius, // Make red points bigger
        }
      ]
    };

    chartOptions.value = {
      responsive: true,
      scales: {
        x: {
          title: {
            display: true,
            text: 'Date'
          }
        },
        y: {
          title: {
            display: true,
            text: 'Value'
          }
        }
      }, plugins: {
        datalabels: false // Disable datalabels plugin for the line chart
      }
    };

    chartDataReady.value = true;
  }
};
// Functions for adding/editing/deleting notes
const enableAddNotePrompt = (id) => {
  const difference = differences.value.find(diff => diff._id === id);
  difference.addingNote = true;
};

const cancelAddNotePrompt = (id) => {
  const difference = differences.value.find(diff => diff._id === id);
  difference.addingNote = false;
  difference.newNote = '';
};

const saveNewNotePrompt = async (changeId) => {
  const difference = differences.value.find(diff => diff._id === changeId);
  if (!difference.newNote) return;

  try {
    await api.post('/add-note', {
      changeId,
      newNote: difference.newNote
    }, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });

    difference.notes.push({ _id: ObjectID().toHexString(), note: difference.newNote, timestamp: new Date().toISOString() });
    difference.newNote = ''; // Clear input
    difference.addingNote = false; // Hide the input field
  } catch (error) {
    console.error('Error adding note:', error);
  }
};

const enableEditMode = (changeId, noteId) => {
  const difference = differences.value.find(diff => diff._id === changeId);
  const note = difference.notes.find(note => note._id === noteId);
  note.isEditing = true;
  note.newNote = note.note;
};

const saveNotePrompt = async (changeId, noteId) => {
  const difference = differences.value.find(diff => diff._id === changeId);
  const note = difference.notes.find(note => note._id === noteId);
  if (!note.newNote) return;

  try {
    await api.post('/edit-note', {
      changeId,
      noteId,
      updatedNote: note.newNote
    }, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });

    note.note = note.newNote;
    note.isEditing = false;
    note.timestamp = new Date().toISOString();
  } catch (error) {
    console.error('Error updating note:', error);
  }
};

const cancelEditMode = (changeId, noteId) => {
  const difference = differences.value.find(diff => diff._id === changeId);
  const note = difference.notes.find(note => note._id === noteId);
  note.isEditing = false;
  note.newNote = note.note;
};

const deleteNotePrompt = async (changeId, noteId) => {
  try {
    await api.post('/delete-note', {
      changeId,
      noteId
    }, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });

    const difference = differences.value.find(diff => diff._id === changeId);
    difference.notes = difference.notes.filter(note => note._id !== noteId);
  } catch (error) {
    console.error('Error deleting note:', error);
  }
};

const formatTimestamp = (timestamp) => {
  const date = new Date(timestamp);
  return date.toLocaleString();
};
</script>

<style scoped>
.history-checker {
  padding: 20px;
  background-color: white;
  border: 1px solid #ccc;
  padding: 20px;
  border-radius: 8px;
}

button {
  padding: 10px 20px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

button:hover {
  background-color: #0056b3;
}

table {
  margin-top: 10px;
  width: 100%;
  border-collapse: collapse;
  border-radius: 8px;
}

th,
td {
  border: 1px solid #ccc;
  padding: 8px;
  text-align: left;
}

th {
  background-color: #f2f2f2;
}

td {
  background-color: #fff;
}

.change-key {
  display: block;
  /* Ensure each change key is on a new line */
}

.icon-buttons {
  display: inline-flex;
  gap: 5px;
  margin-left: 5px;
}

.icon-button {
  background: none;
  border: none;
  cursor: pointer;
  padding: 5px;
  color: #007bff;
}

.icon-button:hover {
  color: #fff;
  background-color: #007bff;
}

.note-input {
  display: flex;
  align-items: center;
  gap: 5px;
  margin-bottom: 10px;
}

.note {
  position: relative;
  padding-bottom: 5px;
  margin-bottom: 5px;
}

.note:not(:last-child) .note-separator {
  content: "";
  display: block;
  height: 1px;
  background-color: #ccc;
  margin-top: 5px;
}

.note-timestamp {
  display: block;
  font-size: 0.8em;
  color: #888;
  margin-bottom: 5px;
}

.add-note-button {
  margin-top: 10px;
  display: flex;
  align-items: center;
  gap: 5px;
}

.add-note-button .icon-button {
  margin-left: 5px;
}

@keyframes flash {
  0% {
    background-color: yellow;
    opacity: 1;
  }

  50% {
    background-color: transparent;
    opacity: 0.5;
  }

  100% {
    background-color: yellow;
    opacity: 1;
  }
}

.flash-row {
  animation: flash 1s ease-in-out 3;
}
</style>