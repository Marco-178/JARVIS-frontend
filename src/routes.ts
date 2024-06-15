import { createRouter, createWebHistory } from 'vue-router';
import type { RouteRecordRaw } from 'vue-router';
import HomePage from './components/MainPage.vue';
import PrenotationsPage from './components/PrenotationsPage.vue';

const routes: RouteRecordRaw[] = [
    {
        path: '/',
        name: 'HomePage',
        component: HomePage,
    },
    {
        path: '/prenotations',
        name: 'prenotations',
        component: PrenotationsPage,
    },
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

export default router;
