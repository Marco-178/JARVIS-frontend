import { defineStore } from 'pinia';
import {EventInfo} from '@/types';

export const useEventStore = defineStore('dataEventInfo', {
    state: () => ({
        dataEventInfo: {} as EventInfo,
    }),
    actions: {
        setBookings(data: EventInfo) {
            this.dataEventInfo = data;
        },
    },
    getters: {
        getBookings: (state) => state.dataEventInfo,
    },
});
