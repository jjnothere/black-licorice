<!-- HistoryPage.vue -->
<template>
  <div class="content">
    <HistoryChecker :dateRange="dateRange" />
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuth } from '@/composables/auth';
import HistoryChecker from '@/components/HistoryChecker.vue'; // Import the HistoryChecker component

defineProps({
  dateRange: Object
});

const router = useRouter();
const { setAuth, checkAuthStatus } = useAuth();

onMounted(() => {

  // Check the search params

  // Extract token from URL
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get('token'); // Extract token


  if (token) {
    // Store the token in localStorage
    localStorage.setItem('token', token);

    // Mark the user as authenticated
    setAuth(true);
  } else {
    checkAuthStatus(router);  // Only check auth status if no token is found
  }
});

</script>

<style scoped>
/* Add your styles here */
</style>