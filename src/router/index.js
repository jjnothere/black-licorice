import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '@/views/Home.vue';
import BudgetTracker from '@/views/BudgetPacing.vue';
import HistoryChecker from '@/components/HistoryChecker.vue';
import Auth from '@/views/Auth.vue';
import AuthLayout from '@/components/AuthLayout.vue';

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView,
    meta: { requiresAuth: true },
  },
  {
    path: '/budget-tracker',
    name: 'BudgetTracker',
    component: BudgetTracker,
    meta: { requiresAuth: true },
  },
  {
    path: '/history',
    name: 'History',
    component: HistoryChecker,
    props: route => ({
      selectedCampaigns: route.query.selectedCampaigns ? route.query.selectedCampaigns.split(',') : [],
      dateRange: route.query.dateRange ? JSON.parse(route.query.dateRange) : {},
    }),
    meta: { requiresAuth: true },
  },
  {
    path: '/auth',
    component: AuthLayout,
    children: [
      { path: '', name: 'Auth', component: Auth },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token');
  if (to.matched.some(record => record.meta.requiresAuth) && !token) {
    next('/auth');
  } else {
    next();
  }
});

export default router;