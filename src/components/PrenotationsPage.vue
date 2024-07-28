<script setup lang="ts">
/*
Usare query fatta su backend per visualizzare tutte le prenotazioni associate a un codice fiscale.
Le prenotazioni vengono salvate in DB uno a uno dal MainPage non appena si clicca il tasto "prenota"
 */
  import {ref} from 'vue'
  import axios, {type AxiosResponse} from "axios";
  import {Booking} from "@/types";
  const dataBooking = ref<Booking[]>([]);

  axios.get<Booking[]>("api/booking/ls").then((response: AxiosResponse<Booking[]>) => { // TODO rifare quando verranno implementati i servizi REST sul backend, forse da spostare in BackendInteract e fare caching per ridurre tempo di attesa
    console.log("Risposta da Axios: ", response);
    console.log("Dati ricevuti: ", response.data);
    response.data.forEach(item => {
      if ('id' in item) {
        const newBooking = new Booking(item.id, item.codice_fiscale, item.date, item.duration, item.venue, item.personnel);
        dataBooking.value.push(newBooking);
      } else {
        console.log("Unknown Object", response.data);
      }
    });
  }).catch(error => {
    console.error("Errore durante la richiesta Axios: ", error);
  });

</script>

<template>
  <title>Prenotazioni</title>
  <h1>Prenotazioni</h1>
  <div v-if="dataBooking.length > 0">
    <section v-for="booking in dataBooking" :key="booking.id">{{booking.venue.name}} <br> {{booking.venue.address}} <br> {{booking.venue.max_capacity}} <br> {{booking.venue.rent_cost}} <br> {{booking.date}} <br>
      <div v-for="personnel in booking.personnel" :key="personnel.name">{{personnel.name}} <br> {{personnel.hourly_cost}}<hr> </div></section>
  </div>
  <div v-else class="container">
    <img src="/ErrorImage.png" alt="Error image" class="image"/>
  </div>
</template>

<style scoped>
  .container{
    display:flex;
    justify-content: center;
    align-items: start;
    height: 100vh;
    width: 100vw;
  }

  .image {
    max-width: 50%;
    max-height: 55%;
    object-fit: contain;
  }

</style>