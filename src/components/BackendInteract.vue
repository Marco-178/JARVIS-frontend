<script setup lang="ts">
  import axios from 'axios';
  import type { AxiosResponse } from 'axios';
  import { provide, ref } from 'vue';
  import { Venue, Booking, Personnel, EventInfo } from '@/types'

  const dataVenue     = ref<Venue[]>([]);
  const dataPersonnel = ref<Personnel[]>([]);
  const dataBooking   = ref<Booking[]>([]);
  const dataEventInfo = ref<EventInfo[]>([]);
  //La risposta restituisce oggetti diversi che vengono salvati nei rispettivi array indicati nel tipo AllowedData
  type AllowedData = Venue[] | Personnel[] | Booking[] | EventInfo[];

  provide('dataPersonnel', dataPersonnel);

  // ma a che ci serve la chiamata al DB ????? Visto che ci serve solo REST
  /*axios.get<AllowedData>("/api/venue/ls").then((response: AxiosResponse<AllowedData>) => {
    console.log("Risposta da Axios:", response);
    console.log("Dati ricevuti:", response.data);
    // è una soluzione semplice ma non scalabile quindi forse è meglio fare un confronto degli attributi
    response.data.forEach(item => {
          if ('address' in item) {
            const newVenue = new Venue(item.id, item.name, item.address, item.max_capacity, item.rent_cost, item.weekdayHours, item.weekendHours, item.closingDays, item.booking);
            console.log(newVenue);
            dataVenue.value.push(newVenue);
            console.log("Venue", dataVenue.value);
          } else if ('sector' in item) {
            dataPersonnel.value.push(new Personnel(item.name, item.hourly_cost, item.weekdayHours, item.weekendHours, item.sector));
            console.log("Personnel", dataPersonnel.value);
          } else if ('duration' in item) {
            dataBooking.value.push(new Booking(item.id, item.codice_fiscale, item.date, item.duration, item.venue, item.personnel));
            console.log("Personnel", dataPersonnel.value);
          } else {
            console.log("Unknown Object", response.data)
          }
    });
  }).catch(error => {
    console.error("Errore durante la richiesta Axios:", error);
  });*/

  /*axios.get<AllowedData>("/api/callREST/getEvents").then((response: AxiosResponse<AllowedData>) => {
    console.log("Risposta da Axios:", response);
    console.log("Dati ricevuti:", response.data);
    // è una soluzione semplice ma non scalabile quindi forse è meglio fare un confronto degli attributi
    response.data.forEach(item => {
          if ('event_type' in item) {
            const newEventInfo = new EventInfo(item);
            console.log(newEventInfo);
            dataEventInfo.value.push(newEventInfo);
            console.log("EventInfo", dataEventInfo.value);
          } else {
            console.log("Unknown Object", response.data)
          }
    });
  }).catch(error => {
    console.error("Errore durante la richiesta Axios:", error);
  });

  axios.get<AllowedData>("/api/callREST/getEvent").then((response: AxiosResponse<AllowedData>) => {
    console.log("Risposta da Axios:", response);
    console.log("Dati ricevuti:", response.data);
    // è una soluzione semplice ma non scalabile quindi forse è meglio fare un confronto degli attributi
    response.data.forEach(item => {
      if ('event_type' in item) {
        const newEventInfo = new EventInfo(item);
        console.log(newEventInfo);
        dataEventInfo.value.push(newEventInfo);
        console.log("EventInfo", dataEventInfo.value);
      } else {
        console.log("Unknown Object", response.data)
      }
    });
  }).catch(error => {
    console.error("Errore durante la richiesta Axios:", error);
  });*/
</script>

<template>
  <ul v-if="dataEventInfo.length > 0">
    <li v-for="(item, index) in dataEventInfo" :key="index">
      Item {{ index }}: <br/>
      {{ item }}
      <hr>
    </li>
  </ul>
  <ul v-if="dataVenue.length > 0">
    <li v-for="(item, index) in dataVenue" :key="index">
      Item {{ index }}: <br/>
      {{ item }}
      <hr>
    </li>
  </ul>
  <div v-else>
    Errore BackendInteract: nessun elemento letto dalla richiesta HTTP <!-- non ci sarebbe bisogno perché già in console spunta l'errore -->
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