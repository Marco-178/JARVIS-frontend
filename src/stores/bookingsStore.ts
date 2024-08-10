import { defineStore } from 'pinia';
import {Booking} from '@/types';

export const useBookingStore = defineStore('dataBooking', {
    state: () => ({
        dataBooking: [] as Booking[],
        isDataBookingLoaded: false as boolean,
        isNotified: false as boolean,
        updateBookingsTrigger: false as boolean,
    }),
    actions: {
        setBookings(data: Booking[]) {
            this.dataBooking = data;
        },
        updateData(){
            this.isNotified = false;
            this.updateBookingsTrigger = true;
        },
        notifyBookingsUpdated(){
            this.isNotified = true;
            this.updateBookingsTrigger = false;
        }
    },
    getters: {
        getBookings: (state) => state.dataBooking,
    },
});
