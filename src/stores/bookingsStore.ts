import { defineStore } from 'pinia';
import {Booking} from '@/types';

export const useBookingStore = defineStore('dataBooking', {
    state: () => ({
        dataBooking: [] as Booking[],
        isDataBookingLoaded: false as boolean,
    }),
    actions: {
        setBookings(data: Booking[]) {
            this.dataBooking = data;
        },
    },
    getters: {
        getBookings: (state) => state.dataBooking,
    },
});
