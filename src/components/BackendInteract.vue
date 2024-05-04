<script setup lang="ts">
import axios from 'axios';
import { ref } from 'vue';

// In teoria gli attributi devono essere dello stesso nome e tipo e nello stesso ordine di come vengono forniti dal backend

class Luogo{
  "id": number;
  "address": string;
  "closure_date": string;
  "holiday_start_schedule": string;
  "holiday_end_schedule": string;
  "weekday_start_schedule": string;
  "weekday_end_schedule": string;
  "capacity": number;
  "hourly_rent_cost": number;
}
class Personale{
  "name": string;
  "sector": string;
  "hourly_prenotation_cost": number;
}
class Prenotazione{
  "id": number;
  "date": string;
  "time": string;
  luogo: Luogo;
  personale: Personale;
  constructor(id: number, date: string, time: string, luogo: Luogo, personale: Personale) {
    this.id = id;
    this.date = date;
    this.time = time;
    this.luogo = new Luogo(); //TODO da sistemare
    this.personale = new Personale();
  }
}

class Prova{
  "id": number;
  "name": string;
  "address": string;
}

//const data = ref([]);
//const data = ref(0);
//const data = ref<MyTable[]>([]);
const data = ref<Prova[] | Luogo[] | Personale[] | Prenotazione[]>([]);

axios.get("/api/database/ls").then(response => {
  console.log("Risposta da Axios:", response);
  console.log("Dati ricevuti:", response.data);
  data.value = response.data;
}).catch(error => {
  console.error("Errore durante la richiesta Axios:", error);
});
</script>

<template>
  <div>
    <table>
      <tr v-for="items in data" :key="items.id" >
        <td>{{ items.id }}</td>
        <td>{{ items.name }}</td>
        <td>{{ items.address }}</td>
      </tr>
    </table>
    <div v-if="data.length > 0">
      Numero di elementi in data: {{ data.length }}
    </div>
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