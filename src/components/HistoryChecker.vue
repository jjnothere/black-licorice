<!-- HistoryChecker.vue -->
<template>
  <div class="history-checker">
    <router-link v-if="!isHistoryPage" to="/history" class="nav-link">
      <h3>Change History Log Journal</h3>
    </router-link>
    <br />

    <!-- Metric selection dropdowns -->
    <div class="metric-selection">
      <label for="metric1">Select Metric 1:</label>
      <select id="metric1" v-model="selectedMetric1">
        <option value="conversions">Conversions</option>
        <option value="clicks">Clicks</option>
        <option value="impressions">Impressions</option>
        <option value="spend">Spend</option>
      </select>

      <label for="metric2">Select Metric 2:</label>
      <select id="metric2" v-model="selectedMetric2">
        <option value="none">None</option>
        <option value="conversions">Conversions</option>
        <option value="clicks">Clicks</option>
        <option value="impressions">Impressions</option>
        <option value="spend">Spend</option>
      </select>

      <!-- Time interval selection dropdown -->
      <label for="timeInterval">Select Time Interval:</label>
      <select id="timeInterval" v-model="selectedTimeInterval">
        <option value="daily">Daily</option>
        <option value="weekly">Weekly</option>
        <option value="monthly">Monthly</option>
        <option value="quarterly">Quarterly</option>
      </select>
    </div>

    <!-- Line chart section -->
    <div v-if="chartDataReady">
      <p class="chart-info">Click to add or remove chart metrics</p>
      <div class="line-chart-container">
        <line-chart :chart-data="chartData" :options="chartOptions" @point-clicked="scrollToChange"></line-chart>
      </div>
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

// Reactive variables for selected metrics and time interval
const selectedMetric1 = ref('clicks');
const selectedMetric2 = ref('none');
const selectedTimeInterval = ref('daily');


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
  console.log('Original Date Label:', dateLabel); // Debugging log

  // Adjust the dateLabel by adding one day
  const adjustedDate = new Date(dateLabel);
  adjustedDate.setDate(adjustedDate.getDate());
  const adjustedLabelDate = adjustedDate.toISOString().split('T')[0]; // Normalize to YYYY-MM-DD

  console.log('Adjusted Date Label:', adjustedLabelDate);

  const matchingIndex = filteredDifferences.value.findIndex(diff => {
    const diffDate = new Date(diff.date).toISOString().split('T')[0]; // Normalize to YYYY-MM-DD

    console.log(`Comparing: ${diffDate} with ${adjustedLabelDate}`);
    return diffDate === adjustedLabelDate;
  });

  if (matchingIndex !== -1) {
    const changeRow = document.getElementById(`changeRow-${matchingIndex}`);
    if (changeRow) {
      changeRow.scrollIntoView({ behavior: 'smooth' });
      changeRow.classList.add('flash-row');
      setTimeout(() => {
        changeRow.classList.remove('flash-row');
      }, 3000);
    } else {
      console.error(`Element changeRow-${matchingIndex} not found`);
    }
  } else {
    console.error('No matching index found for adjusted date:', adjustedLabelDate);
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

watch([() => props.selectedCampaigns, () => props.dateRange, selectedMetric1, selectedMetric2, selectedTimeInterval], async () => {
  await fetchAllChanges();
  await checkForChanges();
  getAnalyticsData(); // Update chart data if selected campaigns, date range, selected metrics, or time interval change
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


const getAggregatedData = (data, interval) => {
  const aggregatedData = {};

  const getWeekStart = (date) => {
    const dayOfWeek = date.getDay();
    const diff = date.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1); // Adjust when day is Sunday
    return new Date(date.setDate(diff));
  };

  const getMonthStart = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1);
  };

  const getQuarterStart = (date) => {
    const quarter = Math.floor(date.getMonth() / 3);
    return new Date(date.getFullYear(), quarter * 3, 1);
  };

  data.forEach((item) => {
    const dateParts = item.id.split('-');
    if (dateParts.length === 4) {
      const originalDate = new Date(`${dateParts[3]}-${dateParts[1]}-${dateParts[2]}`);
      let keyDate;

      switch (interval) {
        case 'weekly':
          keyDate = getWeekStart(new Date(originalDate));
          break;
        case 'monthly':
          keyDate = getMonthStart(new Date(originalDate));
          break;
        case 'quarterly':
          keyDate = getQuarterStart(new Date(originalDate));
          break;
        case 'daily':
        default:
          keyDate = originalDate;
          break;
      }

      const key = keyDate.toISOString().split('T')[0]; // Use YYYY-MM-DD format

      if (!aggregatedData[key]) {
        aggregatedData[key] = {
          conversions: 0,
          clicks: 0,
          impressions: 0,
          spend: 0,
          hasChanges: false
        };
      }

      aggregatedData[key].conversions += item.conversions || 0;
      aggregatedData[key].clicks += item.clicks || 0;
      aggregatedData[key].impressions += item.impressions || 0;
      aggregatedData[key].spend += parseFloat(item.spend.replace(/[^0-9.-]+/g, '')) || 0;

      if (filteredDifferences.value.some(diff => new Date(diff.date).toLocaleDateString() === keyDate.toLocaleDateString())) {
        aggregatedData[key].hasChanges = true;
      }
    }
  });

  return aggregatedData;
};

const formatDateLabel = (dateString) => {
  const date = new Date(dateString);
  const month = date.getMonth() + 1; // No leading zero for the month
  const day = date.getDate(); // No leading zero for the day
  const year = date.getFullYear();
  return `${month}/${day}/${year}`; // Format as "M/D/YYYY"
};

const getAnalyticsData = () => {
  if (props.metrics && props.metrics.length) {
    const aggregatedData = getAggregatedData(props.metrics, selectedTimeInterval.value);

    const labels = Object.keys(aggregatedData)
      .reverse()
      .map(date => {
        const adjustedDate = new Date(date);
        adjustedDate.setDate(adjustedDate.getDate() + 1); // Shift date forward by one day
        return formatDateLabel(adjustedDate.toISOString().split('T')[0]);
      });

    const metric1Data = labels.map((_, index) => aggregatedData[Object.keys(aggregatedData).reverse()[index]][selectedMetric1.value]);
    const metric2Data = selectedMetric2.value !== 'none'
      ? labels.map((_, index) => aggregatedData[Object.keys(aggregatedData).reverse()[index]][selectedMetric2.value])
      : [];

    const pointBackgroundColors = labels.map((_, index) => aggregatedData[Object.keys(aggregatedData).reverse()[index]].hasChanges ? 'red' : 'black');
    const pointBorderColors = labels.map((_, index) => aggregatedData[Object.keys(aggregatedData).reverse()[index]].hasChanges ? 'darkred' : 'black');
    const pointRadius = labels.map((_, index) => aggregatedData[Object.keys(aggregatedData).reverse()[index]].hasChanges ? 4 : 3);

    chartData.value = {
      labels,
      datasets: [
        {
          label: selectedMetric1.value.charAt(0).toUpperCase() + selectedMetric1.value.slice(1),
          data: metric1Data,
          borderColor: 'blue',
          fill: false,
          pointBackgroundColor: pointBackgroundColors,
          pointBorderColor: pointBorderColors,
          pointRadius: pointRadius,
        },
        ...(selectedMetric2.value !== 'none' ? [{
          label: selectedMetric2.value.charAt(0).toUpperCase() + selectedMetric2.value.slice(1),
          data: metric2Data,
          borderColor: 'green',
          fill: false,
          pointBackgroundColor: pointBackgroundColors,
          pointBorderColor: pointBorderColors,
          pointRadius: pointRadius,
        }] : [])
      ]
    };

    chartOptions.value = {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          type: 'category',
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
      },
      plugins: {
        datalabels: false
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

// Function to delete a note
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

// Function to format timestamp
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

.chart-info {
  text-align: center;
}

.line-chart-container {
  width: 100%;
  /* Keep the chart full-width */
  max-height: 900px;
}

canvas {
  min-height: 300px !important;
  /* Enforces a minimum height of 300px */
  height: auto !important;
  /* Allows the height to adjust if it needs to grow beyond 300px */
}
</style>