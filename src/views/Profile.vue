<template>
  <div class="profile">
    <h2>Profile</h2>
    <div class="profile-info">
      <p><strong>Email:</strong> {{ user.email }}</p>
      <p><strong>Ad Account ID:</strong> {{ user.accountId }}</p>
    </div>
    <!--<form @submit.prevent="updateAccountId">
      <div class="form-group">
        <label for="account-id">Ad Account ID:</label>
        <input type="text" id="account-id" v-model="accountId" maxlength="9" required @input="validateAccountId" />
        <div class="error-container">
          <p v-if="accountIdError" class="error-message">{{ accountIdError }}</p>
        </div>
      </div>
      <button type="submit">Update Account ID</button>
    </form>-->
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import api from '@/api';
import { useAuth } from '@/composables/auth'; // Assuming you have a useAuth composable

const { isLoggedIn, user, checkAuthStatus } = useAuth();
const accountId = ref('');
const accountIdError = ref('');

const fetchUserProfile = async () => {
  try {
    const response = await api.get('/user-profile', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    });
    user.email = response.data.email;
    user.accountId = response.data.accountId;
  } catch (error) {
    console.error('Error fetching user profile:', error);
  }
};

const validateAccountId = () => {
  if (!/^\d{9}$/.test(accountId.value)) {
    accountIdError.value = 'Ad Account ID must be a 9-digit number';
  } else {
    accountIdError.value = '';
  }
};

const updateAccountId = async () => {
  validateAccountId();
  if (accountIdError.value) {
    alert('Please fix the errors before submitting.');
    return;
  }

  try {
    // Make an API call to update the account ID in the user's profile
    await api.post('/update-account-id', { accountId: accountId.value }, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    });
    user.accountId = accountId.value; // Update the reactive user object
    alert('Account ID updated successfully');
    accountId.value = ''; // Clear the input field after successful submission
  } catch (error) {
    console.error('Error updating account ID:', error);
    alert('Failed to update account ID');
  }
};

onMounted(() => {
  checkAuthStatus();
  if (isLoggedIn.value) {
    fetchUserProfile();
  }
});
</script>

<style scoped>
.profile {
  display: flex;
  flex-direction: column;
  background-color: white;
  border: 1px solid #ccc;
  padding: 20px;
  border-radius: 8px;
}

.profile-info {
  margin-bottom: 20px;
  text-align: left;
}

.form-group {
  width: 100%;
}

form label {
  display: block;
  margin-bottom: 5px;
}

form input {
  width: 250px;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-sizing: border-box;
}

.error-container {
  height: 1.2em;
  /* Fixed height for the error message container */
  margin-top: 5px;
  /* Space between input and error message */
}

.error-message {
  color: red;
  font-size: 0.9em;
  margin: 0;
  /* Remove default margin */
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
</style>