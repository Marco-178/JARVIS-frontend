import { defineStore } from 'pinia';
import {Personnel} from '@/types';

export const usePersonnelStore = defineStore('dataPersonnel', {
    state: () => ({
        dataPersonnel: [] as Personnel[],
        isDataPersonnelLoaded: false as boolean,
    }),
    actions: {
        setBookings(data: Personnel[]) {
            this.dataPersonnel = data;
        },
    },
    getters: {
        getBookings: (state) => state.dataPersonnel,
    },
});
