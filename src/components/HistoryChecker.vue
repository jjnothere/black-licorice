<!-- HistoryChecker.vue -->
<template>
  <div class="history-checker">
    <router-link v-if="!isHistoryPage" to="/history" class="nav-link">
      <h3>Change History Log Journal</h3>
    </router-link>
    <br />
    <button v-if="!isHomePage" @click="checkForChanges">Check for Changes</button>
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
        <tr v-for="difference in filteredDifferences" :key="difference._id">
          <td>{{ difference.campaign }}</td>
          <td>{{ difference.date }}</td>
          <td v-html="difference.changes"></td>
          <td>
            <div v-if="difference.addingNote" class="note-input">
              <input v-model="difference.newNote" placeholder="Add a new note" />
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
            <div v-for="(note, noteIndex) in difference.notes.slice().reverse()" :key="noteIndex" class="note">
              <small class="note-timestamp">{{ formatTimestamp(note.timestamp) }}</small>
              <span v-if="!note.isEditing">{{ note.note }}</span>
              <input
                v-if="note.isEditing"
                v-model="note.newNote"
                @keyup.enter="saveNotePrompt(difference._id, noteIndex, true)"
                @blur="saveNotePrompt(difference._id, noteIndex, true)"
              />
              <div v-if="!note.isEditing" class="icon-buttons">
                <button class="icon-button" @click="enableEditMode(difference._id, noteIndex, true)">
                  <i class="fas fa-edit"></i>
                </button>
                <button class="icon-button" @click="deleteNotePrompt(difference._id, noteIndex, true)">
                  <i class="fas fa-trash"></i>
                </button>
              </div>
              <button v-if="note.isEditing" class="icon-button" @click="saveNotePrompt(difference._id, noteIndex, true)">
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
import axios from 'axios';

const route = useRoute();

const isHomePage = computed(() => route.path === '/');
const isHistoryPage = computed(() => route.path === '/history');

const props = defineProps({
  selectedCampaigns: Array,
  dateRange: Object
});

const differences = ref([]);
const campaignsMap = ref({});

const fetchAllChanges = async () => {
  try {
    const response = await axios.get('/api/get-all-changes');
    differences.value = response.data.reverse(); // Reverse the order to show newest first
  } catch (error) {
    console.error('Error fetching all changes from database:', error);
  }
};

const fetchCurrentCampaigns = async () => {
  try {
    const response = await axios.get('/api/get-current-campaigns');
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
    const response = await axios.get('/api/linkedin/ad-campaigns');
    return response.data.elements || [];
  } catch (error) {
    console.error('Error fetching LinkedIn campaigns:', error);
    return [];
  }
};

const checkForChanges = async () => {
  const currentCampaigns = await fetchCurrentCampaigns();
  const linkedInCampaigns = await fetchLinkedInCampaigns();

  const newDifferences = [];
  linkedInCampaigns.forEach((campaign2) => {
    const campaign1 = currentCampaigns.find((c) => c.id === campaign2.id);
    if (campaign1) {
      const changes = [];
      Object.keys(campaign1).forEach((key) => {
        if (key === 'changeAuditStamps') return; // Skip the changeAuditStamps object
        if (JSON.stringify(campaign1[key]) !== JSON.stringify(campaign2[key])) {
          changes.push(`${key}: <span class="old-value">${JSON.stringify(campaign2[key])}</span> => <span class="new-value">${JSON.stringify(campaign1[key])}</span>`);
        }
      });
      if (changes.length > 0) {
        newDifferences.unshift({
          campaign: campaign2.name,
          date: new Date().toLocaleDateString(),
          changes: changes.join('<br>'),
          notes: campaign2.notes || [],
          addingNote: false,
        });
      }
    } else {
      newDifferences.unshift({
        campaign: campaign2.name,
        date: new Date().toLocaleDateString(),
        changes: `New campaign added: ${JSON.stringify(campaign2)}`,
        notes: campaign2.notes || [],
        addingNote: false,
      });
    }
  });

  differences.value = [...newDifferences, ...differences.value];

  try {
    await axios.post('/api/save-campaigns', { campaigns: linkedInCampaigns });
    await axios.post('/api/save-changes', { changes: newDifferences });
  } catch (error) {
    console.error('Error saving campaigns and changes:', error);
  }
};

const enableAddNotePrompt = (id) => {
  const difference = differences.value.find(diff => diff._id === id);
  difference.addingNote = true;
};

const cancelAddNotePrompt = (id) => {
  const difference = differences.value.find(diff => diff._id === id);
  difference.addingNote = false;
  difference.newNote = '';
};

const saveNewNotePrompt = async (id) => {
  const difference = differences.value.find(diff => diff._id === id);
  if (!difference.newNote) return;
  try {
    await axios.post('/api/update-notes', { id, newNote: difference.newNote });
    difference.notes.push({ note: difference.newNote, timestamp: new Date().toISOString() });
    difference.newNote = ''; // Clear input
    difference.addingNote = false; // Hide the input field
  } catch (error) {
    console.error('Error adding note:', error);
  }
};

const enableEditMode = (id, noteIndex, reversed) => {
  const difference = differences.value.find(diff => diff._id === id);
  const note = reversed ? difference.notes[difference.notes.length - 1 - noteIndex] : difference.notes[noteIndex];
  note.isEditing = true;
  note.newNote = note.note;
};

const saveNotePrompt = async (id, noteIndex, reversed) => {
  const difference = differences.value.find(diff => diff._id === id);
  const note = reversed ? difference.notes[difference.notes.length - 1 - noteIndex] : difference.notes[noteIndex];
  if (note.newNote === note.note) {
    note.isEditing = false;
    return;
  }
  try {
    await axios.post('/api/edit-note', { id, noteIndex: reversed ? difference.notes.length - 1 - noteIndex : noteIndex, updatedNote: note.newNote });
    note.note = note.newNote;
    note.timestamp = new Date().toISOString();
    note.isEditing = false;
  } catch (error) {
    console.error('Error saving note:', error);
  }
};

const deleteNotePrompt = async (id, noteIndex, reversed) => {
  try {
    await axios.post('/api/delete-note', { id, noteIndex: reversed ? differences.value.find(diff => diff._id === id).notes.length - 1 - noteIndex : noteIndex });
    const difference = differences.value.find(diff => diff._id === id);
    difference.notes.splice(reversed ? difference.notes.length - 1 - noteIndex : noteIndex, 1);
  } catch (error) {
    console.error('Error deleting note:', error);
  }
};

const formatTimestamp = (timestamp) => {
  const date =
new Date(timestamp);
return date.toLocaleString();
};

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

onMounted(async () => {
await fetchAllChanges();
await checkForChanges();
});

watch([() => props.selectedCampaigns, () => props.dateRange], async () => {
await fetchAllChanges();
await checkForChanges();
});
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

  th, td {
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
</style>