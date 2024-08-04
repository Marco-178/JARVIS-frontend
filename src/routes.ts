import { createRouter, createWebHistory } from 'vue-router';
import type { RouteRecordRaw } from 'vue-router';
import HomePage from './components/MapPage.vue';
import PrenotationsPage from './components/BookingsPage.vue';

const routes: RouteRecordRaw[] = [
    {
        path: '/',
        name: 'HomePage',
        component: PrenotationsPage,
    },
    {
        path: '/bookings',
        name: 'bookings',
        component: HomePage,
    },
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

export default router;
