import { defineStore } from 'pinia';
import {EventInfo} from '@/types';

export const useEventStore = defineStore('dataEventInfo', {
    state: () => ({
        dataEventInfo: {} as EventInfo,
    }),
    actions: {
        setEvents(data: EventInfo) {
            this.dataEventInfo = data;
        },
    },
    getters: {
        getEvents: (state) => state.dataEventInfo,
    },
});
