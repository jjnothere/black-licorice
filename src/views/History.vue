<template>
  <div class="content">
    <HistoryChecker /> <!-- Use the HistoryChecker component -->
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuth } from '@/composables/auth';
import HistoryChecker from '@/components/HistoryChecker.vue'; // Import the HistoryChecker component

const router = useRouter();
const { setAuth, checkAuthStatus } = useAuth();

onMounted(() => {
  console.log("Full URL:", window.location.href); // Full URL logged

  // Check the search params
  console.log("URL Search Params:", window.location.search);

  // Extract token from URL
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get('token'); // Extract token

  console.log("Extracted token:", token); // Log the extracted token

  if (token) {
    // Store the token in localStorage
    localStorage.setItem('token', token);
    console.log("Stored token in localStorage:", localStorage.getItem('token'));

    // Mark the user as authenticated
    setAuth(true);
  } else {
    console.log('No token found, checking auth status');
    checkAuthStatus(router);  // Only check auth status if no token is found
  }
});

</script>

<style scoped>
/* Add your styles here */
</style>