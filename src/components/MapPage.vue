<script setup lang="ts">
import JSConfetti from 'js-confetti'
import L from 'leaflet'
import {ref, onMounted} from 'vue'
import axios from 'axios';
import {Venue, Booking, Personnel} from '@/types';

import 'leaflet/dist/leaflet.js';
import 'leaflet/dist/leaflet.css';

import {storeToRefs} from "pinia";
import {useVenuesStore} from '@/stores/venuesStore';
import {useBookingStore} from '@/stores/bookingsStore';
import {usePersonnelStore} from '@/stores/personnelStore';
import {useEventStore} from '@/stores/eventStore';
import {useUserStore} from '@/stores/userStore';

const confetti = new JSConfetti();
const mapContainer = ref<HTMLElement>();

let map: L.Map;
let indirizzo: string;

const venuesStore = useVenuesStore();
const bookingStore = useBookingStore();
const personnelStore = usePersonnelStore();
const eventStore = useEventStore();
const userStore = useUserStore();

const {dataVenue} = storeToRefs(venuesStore);
const {isDataVenueLoaded} = storeToRefs(venuesStore);
const {dataBooking} = storeToRefs(bookingStore);
const {isDataBookingLoaded} = storeToRefs(bookingStore);
const {dataPersonnel} = storeToRefs(personnelStore);
const {isDataPersonnelLoaded} = storeToRefs(personnelStore);
const {dataEventInfo} = storeToRefs(eventStore);
const {dataUser} = storeToRefs(userStore);

const markerArray = ref<markerAddress[]>([]);
const selectedVenue = ref<Venue>();
const selectedPersonnel = ref<Personnel[]>([]);
const loadedMarkers = ref<number>(0);

class markerAddress{
  latlon: {
    lat: number;
    lon: number;
  };
  address: string;
  constructor(lat: number, lon: number, address: string){
    this.latlon = {lat, lon};
    this.address = address;
  }
}

onMounted(async () => {
  await waitForDataReady();
  initializeMap();
});

async function waitForDataReady(maxAttempts = 50, checkInterval = 500) {
  let attempts = 0;
  while (attempts < maxAttempts) {
    if (checkIfDataIsReady()) {
      console.log("Tutti i dati sono pronti!");
      return true;
    }
    else console.log("Dati non pronti");
    attempts++;
    await new Promise(resolve => setTimeout(resolve, checkInterval));
  }
  console.error("I dati non sono pronti dopo", maxAttempts, " tentativi e tempo di attesa di ", (checkInterval*maxAttempts)/1000 ," secondi");
  return false;
}

function checkIfDataIsReady() {
  // per gli array si usa un boolean che è true solo quando tutti i dati sono confermati letti dalla risposta axios (così è possibile ricevere anche array vuoti)
  if(isDataVenueLoaded.value
      && isDataBookingLoaded.value
      && isDataPersonnelLoaded.value
      && dataEventInfo.value
      && dataUser.value)
    return true;
}

function initializeMap(){
  if(mapContainer.value){
    map = L.map(mapContainer.value,{
      center: [42.838215, 12.619852],
      zoom: 6,
      zoomControl: false,
    });
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);
  }
  initializeMarkers();
}

async function initializeMarkers(){
  const maxRetries = 3;
  const fetchGeocode = async(address:string, retries=0) => {
    const startTime = performance.now();
    try{
      const response = await axios.get(
        'https://nominatim.openstreetmap.org/search',
        {
          params: {
            q: address,
            format: 'json'
          },
        });
        const endTime = performance.now();
        console.log(`Richiesta "${address}" terminata con successo in ${(endTime-startTime)/1000} secondi`)
        if(response.data && response.data.length > 0) {
          const bestResult = response.data[0];
          localStorage.setItem(address, JSON.stringify(bestResult));
          createMarker(address, bestResult);
        }
        else{
          console.error("Nessun risultato trovato per '${address}'");
        }
    }
    catch (error) {
      const endTime = performance.now();
      console.error('Errore durante la geocodifica:', error);
      console.log(`Richiesta "${address}" fallita dopo ${(endTime-startTime)/1000} secondi`) // TODO: risolvere errore CORS https://chatgpt.com/share/2e188179-bf8f-477f-8664-f7ab0fffdfc7

      if (retries < maxRetries){
        console.log(`Riprovo la richiesta per "${address}". Tentativo ${retries + 1}`);
        await fetchGeocode(address, retries + 1);
      } else {
        console.error(`Richiesta per "${address}" fallita dopo ${maxRetries} tentativi`); // TODO: segnalare errore a utente
        const ghostMarker = new markerAddress(0, 0, address); // evita che la barra di caricamento si blocchi
        markerArray.value.push(ghostMarker);
        updateGeocodingStatusBar();
      }
    }
  };
  const promises = dataVenue.value.map( async (venue) => {
    const address = venue.address;
    const cachedData = localStorage.getItem(address);
    if (cachedData) {
      console.log(`Caricamento localStorage per la geocodifica di "${address}"`);
      const parsedData = JSON.parse(cachedData)
      createMarker(address, parsedData);
      return;
    }
    await fetchGeocode(address);
  });
  await Promise.all(promises);
  updateGeocodingStatusBar(); // in caso non ci siano luoghi disponibili, non mostra la barra di caricamento
  console.log("Fine richieste di geocodifica");
}

function createMarker(address:string, result:any){
  const newMarker = new markerAddress(result.lat, result.lon, address);
  markerArray.value.push(newMarker);
  updateGeocodingStatusBar();
  let marker = L.marker([result.lat, result.lon]).addTo(map).bindPopup(`<div class="popup-text">${result.display_name}</div>`);
  marker.on('click', onMapClick);
}

function findAddress(address: string) { // utilizzo barra di ricerca
  axios.get(
        'https://nominatim.openstreetmap.org/search',
        {
            params: {
              q: address,
              format: 'json'
            }
        }
    ).then((response) =>{
    const { lat, lon } = response.data[0]; // response.data contiene più oggetti di luoghi trovati (?)
    map.setView([lat, lon], 30);
  }).catch (error => {
    console.error('Errore durante la geocodifica:', error); // TODO se non trova il luogo manca la segnalazione all'utente
  });
}

function onMapClick(e: any){
  for(let i=0; i < dataVenue.value.length; i++){
    if (e.latlng.lat == markerArray.value[i].latlon.lat) {
      if (e.latlng.lng == markerArray.value[i].latlon.lon) {
        for (let k = 0; k < dataVenue.value.length; k++) {
          if (dataVenue.value[k].address === markerArray.value[i].address) {
            selectedVenue.value = dataVenue.value[k];
            break;
          }
        }
      }
    }
  }
}

function updateGeocodingStatusBar(){
  if(dataVenue.value.length == 0) loadedMarkers.value = 100;
  else {
    loadedMarkers.value = (markerArray.value.length) / (dataVenue.value.length) * 100;
  }
}

function bookEvent(){
  // TODO: controllo per posti già prenotati nella prenotazione precedente
  confetti.addConfetti({
    confettiRadius: 7,
    confettiNumber: 700,
  })
  if(selectedVenue.value != undefined){
    if(dataUser.value != null) {
      const newBooking = new Booking(
          -1, // placeholder, in lettura il vero id viene recuperato dal DB e in scrittura sul backend mandiamo un oggetto senza id
          "NNNMRC02M01D548F",
          dataEventInfo.value.date,
          {start: dataEventInfo.value.schedule_start, end: dataEventInfo.value.schedule_end},
          selectedVenue.value,
          selectedPersonnel.value,
      )
      dataBooking.value.push(newBooking);
      console.log(dataBooking)
      // TODO aggiunta prenotazione DB + segnalazione errore eventuale
      alert('PRENOTAZIONE AVVENUTA CON SUCCESSO\n');
      const personnelName = [];
      for (let i = 0; i < selectedPersonnel.value.length; i++) {
        personnelName.push(selectedPersonnel.value[i].name);
      }
      const booking = {
        date: dataEventInfo.value.date,
        duration: "00:34:00", // da cambiare
        ssn: dataUser.value.codice_fiscale,
        venueId: selectedVenue.value.id,
        personnelName: personnelName
      };
      console.log(booking);

      axios.post('/api/booking/add', booking, {
        headers: {
          'Content-Type': 'application/json'
        }
      })
          .then(response => {
            console.log('Booking ID:', response.data);
          })
          .catch(error => {
            console.error('Errore:', error.response ? error.response.data : error.message);
          });
      //const response = axios.post('/api/booking/add', JSON.stringify(booking));
    }
    else{
      console.error("Utente non definito!")
    }
  }
  else{
    console.error("selectedVenue non definito!")
  }
}
</script>

<template>
  <title>Nuova Prenotazione</title>
  <article class="disposition first-content">
    <section class="item-disposition">
      <div style="order: 2"></div>
      <input v-model="indirizzo" type="text" name="ricerca" placeholder="Indirizzo da cercare">
      <button id="search-button" @click="findAddress(indirizzo)"><img src="/search.png" alt="cerca" height="20"/></button><br>
      <div ref="mapContainer" id="map"/>
      <div v-if="loadedMarkers < 100" class="progress">
        <div class="progress-bar progress-bar-striped active" role="progressbar" aria-valuenow="40" aria-valuemin="0" aria-valuemax="100" :style="{width: loadedMarkers + '%'}"> <!--  TODO: cambiare aria-valuenow-->
          Caricamento luoghi: {{loadedMarkers.toFixed(1)}}%
        </div>
      </div> 
    </section>
    <section class="item-disposition booking-box" v-if="selectedVenue">
      <div style="order: 3"></div>
      <h1 v-if="selectedVenue">{{ selectedVenue.name }}</h1>
      <h2 v-if="selectedVenue">Indirizzo: {{ selectedVenue.address}} </h2>
      <h2 v-if="selectedVenue">Costo orario: {{ selectedVenue.rent_cost}} </h2>
      <div v-if="dataPersonnel.length != 0">
        <label> Selezionare il personale per l'evento :</label>
        <br>
        <form @submit.prevent="bookEvent">
          <div v-for="(option, index) in dataPersonnel" :key="index">
            <input type="checkbox" v-model="selectedPersonnel" :value="option"/>
            <!--button type="button" data-toggle="collapse" :data-target="#'personnel'+index">{{option.name}}</button>
              <div :id="'personnel'+ index" class="collapse">{{ option.hourly_cost }}</div-->
            <span>{{ option.name }}, {{ option.hourly_cost }}</span>
          </div>
        </form>
      </div>
      <div v-else>
        <p> Nessun personale disponibile per il giorno e ora scelti </p>
      </div>
      <button @click="bookEvent">Prenota</button>
    </section>
  </article>
</template>

<style scoped>
  #map{
    height: 580px; width: 580px;
    border: solid var(--highlight-color) 2px;
  }

  h1{
    font-size: 2em;
  }

  h2{
    font-size: 1em;
  }

  .item-disposition{
    margin: 20px;
  }

  .booking-box{
    border: solid 3px var(--highlight-color);
    background-color: var(--color-background-mute);
    padding: 20px;
    color: var(--color-text);
  }

  .disposition{
    display: flex;
    flex-direction: row;
    align-content: center;
    align-items: flex-start;
    padding: 20px;
  }

  input[type='text'] {
    border: solid var(--highlight-color) 2px;
    border-radius: 5px;
    padding: 5px;
    margin: 5px 5px 5px 0;
  }

  #search-button {
    border: solid var(--highlight-color) 2px;
    border-radius: 5px;
    background-color: var(--highlight-color);
    padding: 5px;
    margin: 5px 5px 5px 0;
    transition: 0.5s;
  }

  #search-button:hover {
    border: solid var(--highlight-color) 2px;
    border-radius: 5px;
    background-color: var(--highlight-color);
    transition: 0.5s;
  }
</style>