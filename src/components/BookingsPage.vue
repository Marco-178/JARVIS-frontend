<script setup lang="ts">
  import {onMounted, ref} from 'vue'
  import {Booking, User} from "@/types";
  import BackendInteract from "@/components/BackendInteract.vue";
  const dataBooking = ref<Booking[]>([]);
  const isDataBookingLoaded = ref<boolean>(false);
  const dataUser = ref<User>();
  const backendInteractRef = ref<InstanceType<typeof BackendInteract> | null>(null);

  function updateDataUser(newData: User){
    dataUser.value = newData;
  }

  function updateDataBooking(newData: Booking[]){
    dataBooking.value = newData;
    isDataBookingLoaded.value = true;
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
  <h1 v-if="dataUser" class="first-content" style="text-align: center;">Prenotazioni dell'utente: {{dataUser.codice_fiscale}}</h1>
  <div v-if="isDataBookingLoaded">
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
        <div style="text-align:right">
          <button id="deleteBookingButton">
            Elimina
            <img src="/red-trash.png">
          </button>
        </div>
      </section>
    </div>
    <div v-else class="container">
      <img src="/ErrorImage.png" alt="Error image" class="image"/>
    </div>
  </div>
  <div v-else class="loader-container">
    <div class="dotsLoader"/>
    <div class="loader"/>
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

  #deleteBookingButton{
    font-weight: 700;
  }

  .loader-container {
    border: solid var(--highlight-color) 3px;
    display: flex;
    justify-content: center;
    align-items: center;
    height: 70vh;
    width: 100%;
    margin: 0 auto;
    text-align: center;
  }

  .loader {
    width: fit-content;
    font-weight: 700;
    font-family: monospace;
    font-size: 30px;
    color :#0000;
    overflow: hidden;
    animation: l9 5s infinite cubic-bezier(0.3,1,0,1);
  }
  .loader:before {
    content:"Loading...";
  }
  @keyframes l9 {
    0%  {text-shadow: 0    0 #FFF, 11ch 0 #fa1c1c, 22ch 0 #11EDFFFF, 33ch 0 var(--highlight-color),44ch 0 var(--navbar-text-color)}
    25% {text-shadow:-11ch 0 #FFF,  0ch 0 #ec9d09, 11ch 0 #11EDFFFF, 22ch 0 var(--highlight-color),33ch 0 var(--navbar-text-color)}
    50% {text-shadow:-22ch 0 #FFF,-11ch 0 #ec9d09,  0ch 0 #11EDFFFF, 11ch 0 var(--highlight-color),22ch 0 var(--navbar-text-color)}
    75% {text-shadow:-33ch 0 #FFF,-22ch 0 #ec9d09,-11ch 0 #11EDFFFF,  0ch 0 var(--highlight-color),11ch 0 var(--navbar-text-color)}
    100%{text-shadow:-44ch 0 #FFF,-33ch 0 #ec9d09,-22ch 0 #11EDFFFF,-11ch 0 var(--highlight-color), 0ch 0 var(--navbar-text-color)}
  }

  .dotsLoader {
    color: var(--highlight-color);
    margin: 0 55px 0;
    width: 4px;
    aspect-ratio: 1;
    border-radius: 50%;
    box-shadow: 19px 0 0 7px, 38px 0 0 3px, 57px 0 0 0;
    transform: translateX(-38px);
    animation: l21 .5s infinite alternate linear;
  }
  @keyframes l21 {
    50%  {box-shadow: 19px 0 0 3px, 38px 0 0 7px, 57px 0 0 3px}
    100% {box-shadow: 19px 0 0 0  , 38px 0 0 3px, 57px 0 0 7px}
  }
</style>
