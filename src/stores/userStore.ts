import { defineStore } from 'pinia';
import {User} from '@/types';

export const useUserStore = defineStore('dataUser', {
    state: () => ({
        dataUser: {} as User | null,
    }),
    actions: {
        setUser(data: User) {
            this.dataUser = data;
        },
    },
    getters: {
        getUser: (state) => state.dataUser,
    },
});
