<template>
  <div>
    <table>
      <thead>
        <tr>
          <th>Campaign</th>
          <th>New Alerts</th>
          <th>History Notes</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(item, index) in items" :key="item._id">
          <td>{{ item.campaign }}</td>
          <td>{{ item.newAlerts }}</td>
          <td>
            <ul>
              <li v-for="(note, noteIndex) in item.historyNotes" :key="noteIndex">
                <span v-if="!note.isEditing">{{ note.note }} ({{ note.timestamp }})</span>
                <input
                  v-if="note.isEditing"
                  v-model="note.newNote"
                  @keyup.enter="saveNotePrompt(index, noteIndex)"
                  @blur="saveNotePrompt(index, noteIndex)"
                />
                <button v-if="!note.isEditing" @click="enableEditMode(index, noteIndex)">Edit</button>
                <button v-if="note.isEditing" @click="saveNotePrompt(index, noteIndex)">Save</button>
                <button @click="deleteNotePrompt(index, noteIndex)">Delete</button>
              </li>
            </ul>
            <input v-model="item.newNote" placeholder="Add a new note" />
            <button @click="addNotePrompt(index)">Add Note</button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  props: {
    items: {
      type: Array,
      required: true
    }
  },
  methods: {
    async addNotePrompt(index) {
      const item = this.items[index];
      if (!item.newNote) return;
      try {
        await axios.post('/api/update-notes', { id: item._id, newNote: item.newNote });
        const response = await axios.get('/api/hello');
        this.$emit('update-items', response.data); // Emit event to update items
        this.items[index].newNote = ''; // Clear input
      } catch (error) {
        console.error('Error adding note:', error);
      }
    },
    enableEditMode(itemIndex, noteIndex) {
      const note = this.items[itemIndex].historyNotes[noteIndex];
      note.isEditing = true;
      note.newNote = note.note;
    },
    async saveNotePrompt(itemIndex, noteIndex) {
      const note = this.items[itemIndex].historyNotes[noteIndex];
      if (note.newNote === note.note) {
        note.isEditing = false;
        return;
      }
      try {
        await axios.post('/api/edit-note', { id: this.items[itemIndex]._id, noteIndex, updatedNote: note.newNote });
        note.note = note.newNote;
        note.timestamp = new Date().toISOString();
        note.isEditing = false;
      } catch (error) {
        console.error('Error saving note:', error);
      }
    },
    async deleteNotePrompt(itemIndex, noteIndex) {
      const item = this.items[itemIndex];
      try {
        await axios.post('/api/delete-note', { id: item._id, noteIndex });
        const response = await axios.get('/api/hello');
        this.$emit('update-items', response.data); // Emit event to update items
      } catch (error) {
        console.error('Error deleting note:', error);
      }
    }
  }
}
</script>

<style scoped>
table {
  width: 100%;
  border-collapse: collapse;
}
th, td {
  padding: 8px;
  text-align: left;
  border: 1px solid #ddd;
}
th {
  background-color: #f2f2f2;
  color: #000;
}
</style>
