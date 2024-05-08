<script setup lang="ts">
  import axios from 'axios';
  import type { AxiosResponse } from 'axios';
  import { ref } from 'vue';

  const data = ref([]);
  const dataVenue = ref<AllowedData>([]);
  const dataPersonnel = ref([]);
  type AllowedData = Venue[];

  interface Venue{
    id: number;
    name: string;
    address: string;
    max_capacity: number;
    rent_cost: number;
    weekdayHours: {
      open: string;
      close: string
    };
    weekendHours: {
      open: string;
      close: string
    };
    closingDays: string[];
    booking: Booking;
  }

  interface Personnel{
    name: string;
    sector: string;
    booking_cost: number;
  }

  interface Booking{
    id: number;
    date: string;
    time: string;
    venue: Venue;
    Personnel: Personnel;
  }

  class Prova{
    id: number;
    name: string;
    address: string;

    constructor(id: number, name: string, address: string) {
      this.id = id;
      this.name = name;
      this.address = address;
    }
  }

  function creaVenue(item: Venue){
    const newVenue = new Prova(item.id, item.name, item.address);
    console.log(newVenue.id, newVenue.name, newVenue.address);
    console.log(item instanceof Prova);
  }

  /*axios.get("/api/database/ls").then(response => {
    console.log("Risposta da Axios:", response);
    console.log("Dati ricevuti:", response.data);
    data.value = response.data;
  }).catch(error => {
    console.error("Errore durante la richiesta Axios:", error);
  });*/

  axios.get<AllowedData>("/api/database/ls").then((response: AxiosResponse<AllowedData>) => {
    console.log("Risposta da Axios:", response);
    console.log("Dati ricevuti:", response.data);
    if(response.data.every(item => 'id' in item)) {
      dataVenue.value = response.data
      console.log("Venue", dataVenue.value);
    }
    else if(response.data.every(item => 'sector' in item)) {
      console.log("AuxiliaryPersonnel", response.data);
    }
  }).catch(error => {
    console.error("Errore durante la richiesta Axios:", error);
  });

</script>

<template>
  <ul v-if="dataVenue.length > 0">
    <li v-for="(item, index) in dataVenue" :key="index">
      Item {{ index }}: <br/>
      {{ item}}
      <button @click="creaVenue(item)">Crea Venue</button>
      <hr>
    </li>
  </ul>
  <div v-else>
    Errore: nessun elemento letto dalla richiesta HTTP <!-- non ci sarebbe bisogno perchè già in console spunta l'errore -->
  </div>
</template>

<style scoped>
  h1 {
    font-weight: 500;
    font-size: 2.6rem;
    position: relative;
    top: -10px;
  }
  h3 {
    font-size: 1.2em;
  }
</style>