import { defineStore } from 'pinia';
import {Venue} from '@/types';

export const useVenuesStore = defineStore('dataVenue', {
    state: () => ({
        dataVenue: [] as Venue[],
        isDataVenueLoaded: false as boolean,
    }),
    actions: {
        setVenues(data: Venue[]) {
            this.dataVenue = data;
        },
    },
    getters: {
        getVenues: (state) => state.dataVenue,
    },
});
