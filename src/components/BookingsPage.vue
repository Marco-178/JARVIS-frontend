<script setup lang="ts">
  import {onMounted, ref} from 'vue'
  import axios, {type AxiosResponse} from "axios";
  import {Booking, User} from "@/types";
  import BackendInteract from "@/components/BackendInteract.vue";
  const dataBooking = ref<Booking[]>([]);
  const dataUser = ref<User>(new User('ALLGR2002123456'));
  const backendInteractRef = ref<InstanceType<typeof BackendInteract> | null>(null);

  axios.get<Booking[]>("api/booking/ls").then((response: AxiosResponse<Booking[]>) => { // TODO rifare quando verranno implementati i servizi REST sul backend, forse da spostare in BackendInteract e fare caching per ridurre tempo di attesa
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
  }).catch(error => {
    console.error("Errore durante la richiesta Axios: ", error);
  });

  function updateDataUser(newData: User){
    dataUser.value = newData;
  }

  function updateDataBooking(newData: Booking[]){
    dataBooking.value = newData;
  }

  onMounted(async () => {
    if (backendInteractRef.value) {
      await backendInteractRef.value.fetchUser();
      await backendInteractRef.value.fetchBookings();
    }
  });

</script>

<template>
  <title>Prenotazioni</title>
  <h1>Prenotazioni dell'utente {{dataUser.codice_fiscale}}</h1>
  <div v-if="dataBooking.length > 0">
    <section id="booking-info" v-for="booking in dataBooking" :key="booking.id">
      <h1>{{booking.venue.name}}</h1>
      {{booking.date}} dalle ore {{booking.duration.start}} alle ore {{booking.duration.end}} <br>
      <strong>Indirizzo:</strong> {{booking.venue.address}} <br>
      <strong>Capacità massima:</strong> {{booking.venue.max_capacity}} <br>
      <strong>Costo:</strong> {{booking.venue.rent_cost}}€
      <h2 v-if="booking.personnel.length > 0">Personale assunto:</h2>
      <div v-for="personnel in booking.personnel" :key="personnel.name">
        {{personnel.name}} - {{personnel.hourly_cost}}€ all'ora
      </div>
    </section>
  </div>
  <div v-else class="container">
    <img src="/ErrorImage.png" alt="Error image" class="image"/>
  </div>
  <BackendInteract
      ref="backendInteractRef"
      @update:dataUser="updateDataUser"
      @update:dataBooking="updateDataBooking"
  />
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

  #booking-info {
	  border: solid var(--highlight-color) 3px;
    padding: 10px;
    margin: 10px 0;
  }

  #booking-info strong {
    font-weight: bold;
  }

  #booking-info h1 {
    color: hsla(160, 100%, 37%, 1);
    font-weight: bold;
    padding: 0;
  }

  #booking-info h2 {
    font-size: 1.4em;
    margin-top: 5px;
  }

</style>
