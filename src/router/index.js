import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '@/views/Home.vue';
import BudgetTracker from '@/views/BudgetPacing.vue';
import HistoryChecker from '@/components/HistoryChecker.vue';

const routes = [
  {
    path: '/',
    name: 'Home',
    component: HomeView
  },
  {
    path: '/budget-tracker',
    name: 'BudgetTracker',
    component: BudgetTracker
  },
  {
    path: '/history',
    name: 'History',
    component: HistoryChecker,
    props: (route) => {
      const selectedCampaigns = route.query.selectedCampaigns ? route.query.selectedCampaigns.split(',') : [];
      const dateRange = route.query.dateRange ? JSON.parse(route.query.dateRange) : {};
      return {
        selectedCampaigns,
        dateRange
      };
    }
  }
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
});

export default router;