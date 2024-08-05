<script setup lang="ts">
  import axios from 'axios';
  import type {AxiosResponse} from 'axios';
  import {ref} from 'vue';
  import {Venue, Booking, Personnel, EventInfo, User} from '@/types'

  const dataVenue = ref<Venue[]>([]);
  const dataBooking = ref<Booking[]>([]);
  const dataPersonnel = ref<Personnel[]>([]);
  const dataEventInfo = ref<EventInfo>(new EventInfo( 2, 'matrimonio', '2024-08-01', '11:00:00', '14:00:00', 100));
  const dataUser = ref<User>(new User('ALLGR2002123456'));

  const emit = defineEmits<{
    (event: 'update:dataVenue', data: Venue[]): void;
    (event: 'update:dataBooking', data: Booking[]): void;
    (event: 'update:dataPersonnel', data: Personnel[]): void;
    (event: 'update:dataEventInfo', data: EventInfo): void;
    (event: 'update:dataUser', data: User): void;
  }>();

  async function fetchEventInfo(){
    await axios.get<EventInfo>("/api/callREST/getEvent").then((response: AxiosResponse<EventInfo>) => {
      console.log("Risposta da Axios:", response);
      console.log("Evento ricevuto:", response.data);
      if('event_type' in response.data){
        dataEventInfo.value = response.data;
      } else {
        console.log("Unknown Object", response.data)
      }
      sendEventInfo();
    }).catch(error => {
      console.error("Errore durante la richiesta Axios:", error);
    });
  }

  async function fetchUser(){
    await axios.get<User>("/api/callREST/getUser").then((response: AxiosResponse<User>) => {
      console.log("Risposta da Axios:", response);
      console.log("Utente ricevuto:", response.data);
      const codice_fiscale = response.data.codice_fiscale;
      dataUser.value = new User(codice_fiscale);
      sendUser();
    }).catch(error => {
      console.error("Errore durante la richiesta Axios:", error);
    });
  }

  async function fetchBookings(){
    await axios.get<Booking[]>("api/booking/ls").then((response: AxiosResponse<Booking[]>) => { // un po' lento
      console.log("Risposta da Axios: ", response);
      console.log("Prenotazioni ricevute: ", response.data);
      response.data.forEach(item => {
        if ('id' in item) {
          const newBooking = new Booking(item.id, item.codice_fiscale, item.date, item.duration, item.venue, item.personnel);
          dataBooking.value.push(newBooking);
        } else {
          console.log("Unknown Object", response.data);
        }
      });
      sendBookings();
    }).catch(error => {
      console.error("Errore durante la richiesta Axios: ", error);
    });
  }

  async function fetchVenues(){
    await axios.get<Venue[]>("/api/venue/available?date=" + dataEventInfo.value.date + "&start=" + dataEventInfo.value.schedule_start + "&end=" + dataEventInfo.value.schedule_end + "&capacity=" + dataEventInfo.value.max_participants).then((response: AxiosResponse<Venue[]>) => {
      console.log("Risposta da Axios: ", response);
      console.log("Luoghi ricevuti: ", response.data);
      response.data.forEach(item => {
        if ('address' in item) {
          const newVenue = new Venue(item.id, item.name, item.address, item.max_capacity, item.rent_cost, item.weekdayHours, item.weekendHours, item.closingDays, item.booking);
          dataVenue.value.push(newVenue);
        } else {
          console.log("Unknown Object", response.data);
        }
      });
      sendVenues();
    }).catch(error => {
      console.error("Errore durante la richiesta Axios: ", error);
      // TODO segnalare errore del server; non è possibile recuperare i luoghi, print errore specifico e codice
    });
  } // TODO segnalare se non ci sono luoghi disponibili per l'evento alla data x e alle ore y e z

  async function fetchPersonnel(event_type:string, date:string, schedule_start:string, schedule_end:string){
    let url = "/api/personnel/available?sectors=" + event_type + "&date=" + date + "&start=" + schedule_start + "&end=" + schedule_end;
    console.log(url);
    try{
      const response: AxiosResponse<Personnel[]> = await axios.get<Personnel[]>(url);
      console.log("Risposta da Axios: ", response);
      console.log("Personale ricevuti: ", response.data);
      response.data.forEach(item => {
        if ('sector' in item) {
          const newPersonnel = new Personnel(item.name, item.hourly_cost, item.weekdayHours, item.weekendHours, item.sector);
          console.log(newPersonnel);
          dataPersonnel.value.push(newPersonnel);
          console.log("Personnel", dataPersonnel.value);
        } else {
          console.log("Unknown Object", response.data);
        }
      });
      sendPersonnel();
    } catch(error) {
      console.error("Errore durante la richiesta Axios: ", error);
    }
  }

  defineExpose({
    fetchEventInfo,
    fetchUser,
    fetchBookings,
    fetchVenues,
    fetchPersonnel
  })

  function sendVenues(){
    emit('update:dataVenue', dataVenue.value);
  }

  function sendBookings(){
    emit('update:dataBooking', dataBooking.value);
  }

  function sendPersonnel(){
    emit('update:dataPersonnel', dataPersonnel.value);
  }

  function sendEventInfo(){
    emit('update:dataEventInfo', dataEventInfo.value);
  }

  function sendUser(){
    emit('update:dataUser', dataUser.value)
  }

</script>

<template>
  <div>
  </div>
</template>
<!-- TODO: fare messaggio di errore in caso di mancanza di luoghi dopo la lettura -->

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