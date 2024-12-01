<!-- HistoryChecker.vue -->
<template>
  <div class="history-checker">
    <div v-if="isLoading">Loading...</div>
    <div v-else>
      <!-- Chart Section -->
      <div class="metric-selection">
        <!-- Metric selection dropdowns -->
        <div class="metric-dropdown">
          <select id="metric1" v-model="selectedMetric1">
            <option value="conversions">Conversions</option>
            <option value="clicks">Clicks</option>
            <option value="impressions">Impressions</option>
            <option value="spend">Spend</option>
          </select>
          <span class="caret blue-caret">&#9662;</span>
        </div>
        <div class="metric-dropdown">
          <select id="metric2" v-model="selectedMetric2">
            <option value="none">None</option>
            <option value="conversions">Conversions</option>
            <option value="clicks">Clicks</option>
            <option value="impressions">Impressions</option>
            <option value="spend">Spend</option>
          </select>
          <span class="caret green-caret">&#9662;</span>
        </div>

        <!-- Time interval selection -->
        <div class="time-interval-dropdown">
          <select v-model="selectedTimeInterval">
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="quarterly">Quarterly</option>
          </select>
          <span class="caret dark-caret">&#9662;</span>
        </div>
      </div>

      <div class="line-chart-container">
        <!-- Show placeholder while data is loading -->
        <div v-if="!chartDataReady" class="chart-placeholder">
          Loading chart data...
        </div>

        <!-- Show "No data" message if there's no data to display after loading -->
        <div v-else-if="isChartDataEmpty" class="chart-placeholder">
          No data to display
        </div>

        <!-- Show actual chart if data is available -->
        <line-chart v-else :chart-data="chartData" :options="chartOptions" @point-clicked="scrollToChange"></line-chart>
      </div>

      <!-- Table Section -->
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
          <tr v-for="(difference) in filteredDifferences" :key="difference._id" :id="`changeRow-${difference._id}`">
            <td class="campaign-name">{{ difference.campaign }}</td>
            <td>{{ difference.date }}</td>
            <td>
              <div v-for="(changeValue, changeKey) in difference.changes" :key="difference._id + '-' + changeKey"
                class="change-item">
                <div class="change-header" @click="toggleChangeDetail(difference._id, changeKey)">
                  <strong :style="{ color: getColorForChange(changeKey) }">
                    {{ keyMapping[changeKey] || changeKey }}
                  </strong>
                  <i :class="difference.expandedChanges?.[changeKey] ? 'fas fa-chevron-down' : 'fas fa-chevron-up'"
                    class="chevron-icon"></i>
                </div>

                <div v-if="difference.expandedChanges?.[changeKey]" class="change-details">
                  <div v-for="(entry) in getFormattedChanges(changeValue, difference.urnInfoMap)"
                    :key="difference._id + '-' + changeKey + '-' + entry.key">
                    <span class="nested-key">{{ entry.key }}:</span>
                    <span class="nested-value">&nbsp;{{ replaceUrnWithInfo(entry.value, difference.urnInfoMap) }}</span>
                  </div>
                </div>
              </div>
            </td>
            <!-- Notes Column in Table -->
            <td class="campaign-notes">
              <!-- Add Note Section -->
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

              <!-- Toggle button to expand/collapse notes -->
              <div v-if="difference.notes && difference.notes.length > 1">
                <button class="icon-button toggle-notes" @click="toggleNotes(difference._id)">
                  <i :class="difference.showAllNotes ? 'fas fa-chevron-up' : 'fas fa-chevron-down'"></i>
                  {{ difference.showAllNotes ? 'Show Less' : 'Show All Notes' }}
                </button>
              </div>

              <!-- Display Notes -->
              <div v-if="difference.showAllNotes">
                <div v-for="note in difference.notes.slice().reverse()" :key="difference._id + '-' + note._id"
                  class="note">
                  <small class="note-timestamp">{{ formatTimestamp(note.timestamp) }}</small>

                  <!-- Edit Note Input -->
                  <div v-if="note.isEditing" class="note-input">
                    <input v-model="note.newNote" @keyup.enter="saveNotePrompt(difference._id, note._id)"
                      @keyup.esc="cancelEditMode(difference._id, note._id)" />
                    <button class="icon-button" @click="saveNotePrompt(difference._id, note._id)">
                      <i class="fas fa-save"></i>
                    </button>
                    <button class="icon-button" @click="cancelEditMode(difference._id, note._id)">
                      <i class="fas fa-times"></i>
                    </button>
                  </div>

                  <!-- Display Note Text and Action Buttons -->
                  <div v-else>
                    <span>{{ note.note }}</span>
                    <div class="icon-buttons">
                      <button class="icon-button" @click="enableEditMode(difference._id, note._id)">
                        <i class="fas fa-edit"></i>
                      </button>
                      <button class="icon-button" @click="deleteNotePrompt(difference._id, note._id)">
                        <i class="fas fa-trash"></i>
                      </button>
                    </div>
                  </div>

                  <div class="note-separator"></div>
                </div>
              </div>
              <div v-else>
                <!-- Show only the newest note with edit/delete buttons -->
                <div class="note" v-if="difference.notes && difference.notes.length > 0">
                  <small class="note-timestamp">
                    {{ formatTimestamp(difference.notes[difference.notes.length - 1].timestamp) }}
                  </small>

                  <!-- Edit Note Input -->
                  <div v-if="difference.notes[difference.notes.length - 1].isEditing" class="note-input">
                    <input v-model="difference.notes[difference.notes.length - 1].newNote"
                      @keyup.enter="saveNotePrompt(difference._id, difference.notes[difference.notes.length - 1]._id)"
                      @keyup.esc="cancelEditMode(difference._id, difference.notes[difference.notes.length - 1]._id)" />
                    <button class="icon-button"
                      @click="saveNotePrompt(difference._id, difference.notes[difference.notes.length - 1]._id)">
                      <i class="fas fa-save"></i>
                    </button>
                    <button class="icon-button"
                      @click="cancelEditMode(difference._id, difference.notes[difference.notes.length - 1]._id)">
                      <i class="fas fa-times"></i>
                    </button>
                  </div>

                  <!-- Display Note Text and Action Buttons -->
                  <div v-else>
                    <span>{{ difference.notes[difference.notes.length - 1].note }}</span>
                    <div class="icon-buttons">
                      <button class="icon-button"
                        @click="enableEditMode(difference._id, difference.notes[difference.notes.length - 1]._id)">
                        <i class="fas fa-edit"></i>
                      </button>
                      <button class="icon-button"
                        @click="deleteNotePrompt(difference._id, difference.notes[difference.notes.length - 1]._id)">
                        <i class="fas fa-trash"></i>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      <div v-else>
        No changes found for the selected filters.
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import ObjectID from 'bson-objectid';
import api from '@/api';
import LineChart from './LineChart.vue'; // Importing the line chart component
import { colorMapping, keyMapping } from '@/constants/constants';

const props = defineProps({
  selectedCampaigns: Array,
  dateRange: Object,
  metrics: Array,
  selectedAdAccountId: String  // Adding metrics prop for chart data
});

// Chart data and state variables
const chartData = ref({});
const chartOptions = ref({});
const chartDataReady = ref(false);

// Reactive variables for selected metrics and time interval
const selectedMetric1 = ref('clicks');
const selectedMetric2 = ref('none');
const selectedTimeInterval = ref('daily');

// Differences and campaigns
const differences = ref([]);
const campaignsMap = ref({});
const isLoading = ref(true);

// Consolidated onMounted hook
onMounted(async () => {
  isLoading.value = true;
  try {
    if (props.selectedAdAccountId) {
      resetChartData();
      await fetchAllChanges();
      await checkForChanges();
      getAnalyticsData();
    }
  } finally {
    isLoading.value = false;
  }
});

// Get color for top-level keys
const getColorForChange = (changeKey) => {
  const mappedKey = keyMapping[changeKey] || changeKey;
  return colorMapping[mappedKey] || 'black'; // Default to black if no color is defined
};

const toggleChangeDetail = (differenceId, changeKey) => {
  const difference = differences.value.find((diff) => diff._id === differenceId);
  if (difference) {
    if (!difference.expandedChanges) {
      difference.expandedChanges = {};
    }
    difference.expandedChanges[changeKey] = !difference.expandedChanges[changeKey];
  }
};

// Helper function to retrieve the token from cookies

const getTokenFromCookies = () => {
  const cookie = document.cookie.split('; ').find(row => row.startsWith('accessToken='));
  const token = cookie ? cookie.split('=')[1] : null;
  return token;
};

const extractUrns = (value, urns = []) => {
  const urnPattern = /urn:li:([a-zA-Z]+):([^\s]+)/g;
  let match;
  while ((match = urnPattern.exec(value)) !== null) {
    urns.push({ urnType: match[1], urnId: match[2] });
  }
};

// Define getFormattedChanges function
const getFormattedChanges = (changeValue, urnInfoMap) => {
  const formatted = formatNestedChange(changeValue, '', urnInfoMap);
  return Object.entries(formatted).map(([key, value]) => ({
    key,
    value: Array.isArray(value) ? value.join(', ') : value, // Join arrays for display
  }));
};

const formatNestedChange = (nestedObject, prefix = '', urnInfoMap = {}) => {
  const result = {};

  if (Array.isArray(nestedObject)) {
    const values = [];
    nestedObject.forEach((item, index) => {
      if (typeof item === 'object' && item !== null) {
        // Recursively process nested objects
        Object.assign(result, formatNestedChange(item, `${prefix}[${index}]`, urnInfoMap));
      } else {
        // Replace URNs with meaningful information
        const formattedValue = replaceUrnWithInfo(item, urnInfoMap);
        values.push(formattedValue);
      }
    });
    if (values.length > 0) {
      result[prefix] = values;
    }
  } else if (typeof nestedObject === 'object' && nestedObject !== null) {
    for (const key in nestedObject) {
      if (['and', 'or'].includes(key.toLowerCase()) || !isNaN(Number(key))) {
        // Skip over 'and', 'or', and numeric keys but process their children
        if (typeof nestedObject[key] === 'object' && nestedObject[key] !== null) {
          Object.assign(result, formatNestedChange(nestedObject[key], prefix, urnInfoMap));
        }
      } else {
        // Create a new prefix with the current key
        const newKey = prefix ? `${prefix}\n${capitalizeFirstLetter(key)}` : capitalizeFirstLetter(key);

        if (typeof nestedObject[key] === 'object' && nestedObject[key] !== null) {
          // Recursively process nested objects
          Object.assign(result, formatNestedChange(nestedObject[key], newKey, urnInfoMap));
        } else {
          // Replace URNs with meaningful information
          const value = nestedObject[key];
          const formattedValue = replaceUrnWithInfo(value, urnInfoMap);
          result[newKey] = formattedValue;
        }
      }
    }
  }
  return result;
};

const capitalizeFirstLetter = (string) => {
  return string.charAt(0).toUpperCase() + string.slice(1);
};
// Update fetchCurrentCampaigns to use getTokenFromCookies
async function fetchCurrentCampaigns() {
  if (!props.selectedAdAccountId) {
    console.warn('No selected Ad Account ID available');
    return [];
  }

  try {
    const token = getTokenFromCookies();
    if (!token) throw new Error("No authorization token found");

    const response = await api.get('/api/get-current-campaigns', {
      params: { accountId: props.selectedAdAccountId },
      headers: { Authorization: `Bearer ${token}` },
      withCredentials: true
    });
    const campaigns = response.data.campaigns || [];
    campaignsMap.value = campaigns.reduce((map, campaign) => {
      map[campaign.id] = campaign.name;
      return map;
    }, {});
    return campaigns;
  } catch (error) {
    console.error('Error fetching campaigns:', error);
    return [];
  }
}

const fetchLinkedInCampaigns = async () => {
  const token = getTokenFromCookies();
  if (!token) {
    console.error("Authorization token missing");
    return [];
  }
  try {
    const response = await api.get('/api/linkedin/ad-campaigns', {
      params: { accountIds: [props.selectedAdAccountId] },
      headers: { Authorization: `Bearer ${token}` },
      withCredentials: true
    });
    return response.data.adCampaigns[props.selectedAdAccountId].campaigns || [];
  } catch (error) {
    console.error('Error fetching LinkedIn campaigns:', error);
    return [];
  }
};

const addNewChange = (newChange) => {
  newChange._id = newChange._id || ObjectID().toHexString(); // Ensure _id is set
  newChange.expandedChanges = {}; // Initialize expandedChanges
  differences.value.push(newChange);
};

const findDifferences = (obj1, obj2, urns = [], urnInfoMap = {}) => {
  const diffs = {};

  for (const key in obj1) {
    if (key === 'changeAuditStamps' || key === 'version') continue;
    if (Object.prototype.hasOwnProperty.call(obj2, key)) {
      if (typeof obj1[key] === 'object' && typeof obj2[key] === 'object') {
        const nestedDiffs = findDifferences(obj1[key], obj2[key], urns, urnInfoMap);
        if (Object.keys(nestedDiffs).length > 0) {
          diffs[key] = nestedDiffs;
        }
      } else if (JSON.stringify(obj1[key]) !== JSON.stringify(obj2[key])) {
        diffs[key] = {
          oldValue: replaceUrnWithInfo(obj1[key], urnInfoMap),
          newValue: replaceUrnWithInfo(obj2[key], urnInfoMap),
        };
        extractUrnsFromValue(obj1[key], urns);
        extractUrnsFromValue(obj2[key], urns);
      }
    } else {
      diffs[key] = {
        oldValue: replaceUrnWithInfo(obj1[key], urnInfoMap),
        newValue: null,
      };
      extractUrnsFromValue(obj1[key], urns);
    }
  }

  for (const key in obj2) {
    if (!Object.prototype.hasOwnProperty.call(obj1, key)) {
      diffs[key] = {
        oldValue: null,
        newValue: replaceUrnWithInfo(obj2[key], urnInfoMap),
      };
      extractUrnsFromValue(obj2[key], urns);
    }
  }

  return diffs;
};

const fetchUrnInformation = async (urns) => {
  const urnInfoMap = {};
  await Promise.all(
    urns.map(async ({ urnType, urnId }) => {
      const name = await fetchUrnInfo(urnType, urnId);
      urnInfoMap[`urn:li:${urnType}:${urnId}`] = name;
    })
  );
  return urnInfoMap;
};

const replaceUrnWithInfo = (value, urnInfoMap) => {
  if (typeof value === 'string') {
    const urnPattern = /urn:li:([a-zA-Z]+):([^\s]+)/g;
    return value.replace(urnPattern, (match) => {
      return urnInfoMap[match] || match; // Use name from urnInfoMap or fallback to the original URN
    });
  } else if (typeof value === 'object' && value !== null) {
    const replacedObject = {};
    for (const key in value) {
      replacedObject[key] = replaceUrnWithInfo(value[key], urnInfoMap);
    }
    return replacedObject;
  }
  return value;
};

const fetchUrnInfo = async (urnType, urnId) => {
  try {
    const response = await api.get('/api/linkedin/targeting-entities', {
      params: {
        urnType: urnType.trim(),
        urnId: urnId.trim(),
      },
      withCredentials: true,
    });

    const targetingData = response.data.name; // Ensure we only get the name
    if (!targetingData) {
      console.warn(`No data found for URN: urn:li:${urnType}:${urnId}`);
      return `Unknown (${urnType})`;
    }
    return targetingData;
  } catch (error) {
    console.error(`Error fetching URN info for ${urnType}:${urnId}`, error);
    return `Error (${urnType})`;
  }
};

const extractUrnsFromValue = (value, urns) => {
  if (typeof value === 'string') {
    extractUrns(value, urns);
  } else if (Array.isArray(value)) {
    value.forEach((item) => extractUrnsFromValue(item, urns));
  } else if (typeof value === 'object' && value !== null) {
    for (const key in value) {
      extractUrnsFromValue(value[key], urns);
    }
  }
};

const checkForChanges = async () => {
  const token = getTokenFromCookies();
  if (!token) {
    console.error('No authorization token found');
    return;
  }

  const currentCampaigns = await fetchCurrentCampaigns();
  const linkedInCampaigns = await fetchLinkedInCampaigns();

  const newDifferences = [];
  const urns = []; // Collect URNs here

  for (const campaign2 of linkedInCampaigns) {
    const campaign1 = currentCampaigns.find((c) => String(c.id) === String(campaign2.id));

    if (campaign1) {
      const changes = findDifferences(campaign1, campaign2, urns);

      if (Object.keys(changes).length > 0) {
        newDifferences.push({
          campaign: campaign2.name,
          date: new Date().toLocaleDateString(),
          changes,
          notes: campaign2.notes || [],
          addingNote: false,
          _id: campaign1._id || ObjectID().toHexString(),
          expandedChanges: {},
          urnInfoMap: {}, // Will be filled after fetching URN info
        });
      }
    } else {
      // Handle new campaigns
      addNewChange({
        campaign: campaign2.name,
        date: new Date().toLocaleDateString(),
        changes: 'New campaign added',
        notes: campaign2.notes || [],
        addingNote: false,
        _id: campaign2._id || ObjectID().toHexString(),
        expandedChanges: {},
        urnInfoMap: {},
      });
    }
  }

  // Fetch URN information
  const uniqueUrns = Array.from(new Set(urns.map(JSON.stringify))).map(JSON.parse);
  const urnInfoMap = await fetchUrnInformation(uniqueUrns);

  // Attach urnInfoMap to each difference
  newDifferences.forEach((difference) => {
    difference.urnInfoMap = urnInfoMap;
  });

  // Now proceed with the rest of your code
  const uniqueDifferences = newDifferences.filter((newDiff) => {
    return !differences.value.some((existingDiff) => {
      const isSameCampaign = existingDiff.campaign === newDiff.campaign;
      const isSameDate = existingDiff.date === newDiff.date;
      const isSameChanges =
        JSON.stringify(existingDiff.changes) === JSON.stringify(newDiff.changes);

      return isSameCampaign && isSameDate && isSameChanges;
    });
  });

  differences.value = [...uniqueDifferences, ...differences.value];

  try {
    await api.post(
      '/api/save-changes',
      { changes: uniqueDifferences.reverse(), adAccountId: props.selectedAdAccountId },
      {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      }
    );
  } catch (error) {
    console.error('Error saving changes:', error);
  }
};

const isChartDataEmpty = computed(() => {
  return !chartData.value || !chartData.value.datasets || chartData.value.datasets.every(dataset => dataset.data.length === 0);
});

const scrollToChange = (dateLabel) => {
  const adjustedDate = new Date(dateLabel);
  const adjustedLabelDate = adjustedDate.toISOString().split('T')[0];

  const matchingDifference = filteredDifferences.value.find(diff => {
    const diffDate = new Date(diff.date).toISOString().split('T')[0];
    return diffDate === adjustedLabelDate;
  });

  if (matchingDifference) {
    const changeRow = document.getElementById(`changeRow-${matchingDifference._id}`);
    if (changeRow) {
      changeRow.scrollIntoView({ behavior: 'smooth' });
      changeRow.classList.add('flash-row');
      setTimeout(() => {
        changeRow.classList.remove('flash-row');
      }, 3000);
    } else {
      console.error(`Element changeRow-${matchingDifference._id} not found`);
    }
  } else {
    console.error('No matching difference found for adjusted date:', adjustedLabelDate);
  }
};

const resetChartData = () => {
  chartData.value = {};
  chartDataReady.value = false;
};

const toggleNotes = (id) => {
  const difference = differences.value.find(diff => diff._id === id);
  if (difference) {
    difference.showAllNotes = !difference.showAllNotes;
  }
};

watch(
  [
    () => props.selectedCampaigns,
    () => props.dateRange,
    selectedMetric1,
    selectedMetric2,
    selectedTimeInterval
  ],
  async () => {
    resetChartData();
    await getAnalyticsData(); // Update chart data when relevant properties change
  }
);

const fetchAllChanges = async () => {
  try {
    const token = getTokenFromCookies();
    if (!token) {
      console.error('No authorization token found');
      return;
    }
    const response = await api.get('/api/get-all-changes', {
      params: { adAccountId: props.selectedAdAccountId },
      headers: { Authorization: `Bearer ${token}` },
      withCredentials: true
    });
    differences.value = response.data.reverse().map(change => {
      // Normalize _id to a string
      if (change._id && typeof change._id === 'object' && change._id.$oid) {
        change._id = change._id.$oid;
      } else if (typeof change._id === 'string') {
        // _id is already a string, do nothing
      } else if (!change._id) {
        change._id = ObjectID().toHexString();
      }
      if (!change.expandedChanges) {
        change.expandedChanges = {};
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
  if (!props.metrics || props.metrics.length === 0) {
    chartDataReady.value = true; // No data, ready to display "No data" message
    return;
  }

  const aggregatedData = getAggregatedData(props.metrics, selectedTimeInterval.value);

  const labels = Object.keys(aggregatedData)
    .reverse()
    .map(date => {
      const adjustedDate = new Date(date);
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
        borderColor: '#61bca8ff',
        fill: false,
        pointBackgroundColor: pointBackgroundColors,
        pointBorderColor: pointBorderColors,
        pointRadius: pointRadius,
      },
      ...(selectedMetric2.value !== 'none' ? [{
        label: selectedMetric2.value.charAt(0).toUpperCase() + selectedMetric2.value.slice(1),
        data: metric2Data,
        borderColor: '#F3D287',
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
};

// Functions for adding/editing/deleting notes
const enableAddNotePrompt = (id) => {
  const difference = differences.value.find(diff => diff._id === id);
  difference.addingNote = true;
};

const cancelAddNotePrompt = (differenceId) => {
  const difference = differences.value.find(diff => diff._id === differenceId);
  if (difference) {
    difference.addingNote = false;
    difference.newNote = '';
  }
};

// Save a new note
const saveNewNotePrompt = async (changeId) => {
  const token = getTokenFromCookies();
  if (!token) {
    console.error('No authorization token found');
    return;
  }
  const difference = differences.value.find(diff => diff._id === changeId);
  if (!difference.newNote) return;

  try {
    await api.post('/api/add-note', {
      accountId: props.selectedAdAccountId,
      campaignId: difference._id,
      newNote: difference.newNote
    }, {
      headers: { Authorization: `Bearer ${token}` },
      withCredentials: true
    });
    difference.notes.push({
      _id: ObjectID().toHexString(),
      note: difference.newNote,
      timestamp: new Date().toISOString()
    });
    difference.notes = [...difference.notes]; // Reassign to trigger reactivity
    difference.newNote = '';
    difference.addingNote = false;
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

// Save edited note
const saveNotePrompt = async (changeId, noteId) => {
  const token = getTokenFromCookies();
  if (!token) {
    console.error('No authorization token found');
    return;
  }
  const accountId = props.selectedAdAccountId;
  const campaignId = changeId;
  const difference = differences.value.find(diff => diff._id === changeId);
  const note = difference.notes.find(note => note._id === noteId);
  if (note.newNote === undefined || !accountId || !campaignId) return;

  try {
    await api.post('/api/edit-note', {
      accountId,
      campaignId,
      noteId,
      updatedNote: note.newNote
    }, {
      headers: { Authorization: `Bearer ${token}` },
      withCredentials: true
    });
    note.note = note.newNote;
    note.isEditing = false;
    note.timestamp = new Date().toISOString();
  } catch (error) {
    console.error('Error updating note:', error);
  }
};


const cancelEditMode = (differenceId, noteId) => {
  const difference = differences.value.find(diff => diff._id === differenceId);
  if (difference) {
    const note = difference.notes.find(note => note._id === noteId);
    if (note) {
      note.isEditing = false;
      note.newNote = note.note;
    }
  }
};

// Function to delete a note
const deleteNotePrompt = async (changeId, noteId) => {
  const token = getTokenFromCookies();
  if (!token) {
    console.error('No authorization token found');
    return;
  }
  const accountId = props.selectedAdAccountId;
  const campaignId = changeId;
  if (!accountId || !campaignId) return;

  try {
    await api.post('/api/delete-note', {
      accountId,
      campaignId,
      noteId
    }, {
      headers: { Authorization: `Bearer ${token}` },
      withCredentials: true
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

watch(
  () => props.selectedAdAccountId,
  async (newAdAccountId) => {
    if (newAdAccountId) {
      isLoading.value = true;
      try {
        resetChartData(); // Reset chart and table
        differences.value = []; // Clear previous differences
        await fetchAllChanges(); // Fetch changes for the new ad account
        await checkForChanges(); // Update the differences table
        getAnalyticsData(); // Update chart data if needed
      } finally {
        isLoading.value = false;
      }
    }
  },
  { immediate: true }
);
</script>

<style scoped>
.history-checker {
  position: relative;
  padding: 15px;
  background-color: #F9F9F8;
  border-radius: 20px;
  margin-bottom: 20px;
}

.history-checker::before,
.history-checker::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: 20px;
  pointer-events: none;
}

.history-checker::before {
  border: 3px solid #BEBDBF;
  top: 5px;
  left: 5px;
  right: 5px;
  bottom: 5px;
}

.history-checker::after {
  border: 3px solid #1C1B21;
}

.metric-selection {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 15px;
}

.metric-dropdown,
.time-interval-dropdown {
  position: relative;
  margin-right: 5px;
}

.color-indicator {
  position: absolute;
  right: 17px;
  top: 50%;
  transform: translateY(-50%);
  width: 10px;
  height: 10px;
  border-radius: 50%;
}

.color-indicator.blue {
  background-color: #61bca8ff;
}

.color-indicator.red {
  background-color: #F3D287;
}

select {
  padding: 5px 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  appearance: none;
}

button {
  padding: 10px 20px;
  background-color: #61bca8ff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

button:hover {
  background-color: #61bca8ff;
}

table {
  margin-top: 10px;
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  border-radius: 20px;
  overflow: hidden;
  color: #1C1B21;
}

th:first-child {
  border-top-left-radius: 20px;
}

th:last-child {
  border-top-right-radius: 20px;
}

tr:last-child td:first-child {
  border-bottom-left-radius: 20px;
}

tr:last-child td:last-child {
  border-bottom-right-radius: 20px;
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
  color: #61bca8ff;
}

.icon-button:hover {
  color: #fff;
  background-color: #61bca8ff;
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
  max-height: 900px;
  min-height: 300px;
}

.chart-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #888;
  font-size: 1.2em;
  background-color: #f2f2f2;
  border-radius: 8px;
  border: 1px solid #ccc;
}

canvas {
  min-height: 300px !important;
  height: auto !important;
}

.metric-dropdown,
.time-interval-dropdown {
  position: relative;
}

.caret {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
  font-size: 20px;
}

.blue-caret {
  color: #61bca8ff;
}

.green-caret {
  color: #F3D287;
}

select {
  padding-right: 30px;
  padding-left: 10px;
}

.campaign-name .campaign-notes {
  white-space: normal;
  word-wrap: break-word;
}

.toggle-notes {
  background: none;
  border: none;
  cursor: pointer;
  padding: 5px;
  color: #61bca8ff;
}

.toggle-notes:hover {
  color: #fff;
  background-color: #61bca8ff;
  border-radius: 4px;
}

.dark-caret {
  color: #1C1B21;
}

.change-item {
  margin-bottom: 10px;
}

.change-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
}

.change-header strong {
  flex-grow: 1;
}

.chevron-icon {
  margin-left: 10px;
  color: #61bca8ff
}

.change-details {
  margin-left: 15px;
  margin-top: 5px;
  transition: max-height 0.3s ease;
  overflow: hidden;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.nested-key {
  font-weight: bold;
}

.change-details div:nth-of-type(even) {
  padding-bottom: 10px;
  margin-bottom: 10px;
  border-bottom: #ccc 1px solid;
}

.change-details div:last-child {
  border: none;
  padding-bottom: 0px;
  margin-bottom: 0px;
}
</style>