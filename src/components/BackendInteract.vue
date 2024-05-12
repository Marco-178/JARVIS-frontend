<script setup lang="ts">
  import axios from 'axios';
  import type { AxiosResponse } from 'axios';
  import { ref } from 'vue';

  const dataVenue     = ref<Venue[]>([]);
  const dataPersonnel = ref<Personnel[]>([]);
  const dataBooking   = ref<Booking[]>([]);
  //La risposta restituisce oggetti diversi che vengono salvati nei rispettivi array indicati nel tipo ALlowedData
  type AllowedData = Venue[] | Personnel[] | Booking[] | EventInfo[];

  class Venue{
    id: number;
    name: string;
    address: string;
    max_capacity: number;
    rent_cost: number;
    weekdayHours: {
      start: string;
      end: string;
    };
    weekendHours: {
      start: string;
      end: string
    };
    closingDays: string[];
    booking: Booking;

    constructor(venue:Venue) {
      this.id = venue.id;
      this.name = venue.name;
      this.address = venue.address;
      this.max_capacity = venue.max_capacity;
      this.rent_cost = venue.rent_cost;
      this.weekdayHours = venue.weekdayHours;
      this.weekendHours = venue.weekendHours;
      this.closingDays = venue.closingDays;
      this.booking = venue.booking;
    }
  }

  class Personnel{
    name: string;
    hourly_cost: number;
    weekdayHours: {
      start: string
      end: string
    };
    weekendHours: {
      start: string
      end: string
    };
    sector: string[];

    constructor(personnel:Personnel) {
      this.name = personnel.name;
      this.hourly_cost = personnel.hourly_cost;
      this.weekdayHours = personnel.weekdayHours;
      this.weekendHours = personnel.weekendHours;
      this.sector = personnel.sector;
    }
  }

  class Booking{
    id: number;
    date: string;
    duration: {
      start: string;
      end: string;
    };
    venue: Venue;
    Personnel: Personnel;

    constructor(booking:Booking) {
      this.id = booking.id;
      this.date = booking.date;
      this.duration = booking.duration;
      this.venue = booking.venue;
      this.Personnel = booking.Personnel;
    }
  }

  class EventInfo{
    event_id: string;
    event_type: string;
    date: string;
    schedule_start: string;
    schedule_end: string;
    max_participants: number;

    constructor(eventInfo:EventInfo) {
      this.event_id = eventInfo.event_id;
      this.event_type = eventInfo.event_type;
      this.date = eventInfo.date;
      this.schedule_start = eventInfo.schedule_start;
      this.schedule_end = eventInfo.schedule_end;
      this.max_participants = eventInfo.max_participants;
    }
  }

  function createVenue(item: Venue){
    const newVenue = new Venue(item);
    console.log(newVenue);
  }

  axios.get<AllowedData>("/api/database/ls").then((response: AxiosResponse<AllowedData>) => {
    console.log("Risposta da Axios:", response);
    console.log("Dati ricevuti:", response.data);
    // è una soluzione semplice ma non scalabile quindi forse è meglio fare un confronto degli attributi
    response.data.forEach(item => {
          if ('address' in item) {
            if(item instanceof Venue){ //se non funziona: TODO metodo di confronto degli attributi
              console.log("istance of Venue detected")
            } else{
              console.log("istance not detected")
            }
            const newVenue = new Venue(item);
            console.log(newVenue);
            dataVenue.value.push(newVenue);
            console.log("Venue", dataVenue.value);
          } else if ('sector' in item) {
            dataPersonnel.value.push(new Personnel(item));
            console.log("Personnel", dataPersonnel.value);
          } else if ('duration' in item) {
            dataBooking.value.push(new Booking(item));
            console.log("Personnel", dataPersonnel.value);
          } else {
            console.log("Unknown Object", response.data)
          }
    });
  }).catch(error => {
    console.error("Errore durante la richiesta Axios:", error);
  });

  //TODO chiamata alla callREST

</script>

<template>
  <ul v-if="dataVenue.length > 0">
    <li v-for="(item, index) in dataVenue" :key="index">
      Item {{ index }}: <br/>
      {{ item }}
      <button @click="createVenue(item)">Crea Venue</button>
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