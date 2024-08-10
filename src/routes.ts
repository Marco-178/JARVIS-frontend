import { createRouter, createWebHistory } from 'vue-router';
import type { RouteRecordRaw } from 'vue-router';
import HomePage from './components/MapPage.vue';
import PrenotationsPage from './components/BookingsPage.vue';

const routes: RouteRecordRaw[] = [
    {
        path: '/',
        name: 'HomePage',
        component: HomePage,
    },
    {
        path: '/bookings',
        name: 'bookings',
        component: PrenotationsPage,
    },
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

export default router;
