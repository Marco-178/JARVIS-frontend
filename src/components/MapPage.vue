<script setup lang="ts">
import JSConfetti from 'js-confetti'
import L from 'leaflet'
import {ref, onMounted, watch} from 'vue'
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
let markersLayer = L.layerGroup();
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

let popupTitle = "placeholder title";
let popupMessage = "placeholder message";

const modal = ref<HTMLDialogElement | null>(null);

function useDialog(title:string, message:string) {
  popupTitle = title;
  popupMessage = message;
  modal.value!.showModal();
}

function closeDialog(){
  modal.value!.close();
}

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
  keepMapUpdated();
}

async function initializeMarkers(){
  markerArray.value = [];
  markersLayer.addTo(map);
  markersLayer.clearLayers();
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
      console.log(`Richiesta "${address}" fallita dopo ${(endTime-startTime)/1000} secondi`)

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
  let marker = L.marker([result.lat, result.lon]).addTo(markersLayer).bindPopup(`<div class="popup-text">${result.display_name}</div>`);
  marker.on('click', onMapClick);
  marker.on('popupclose', () => {
    selectedVenue.value = undefined;
  });
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
  if(dataUser.value != null && selectedVenue.value != undefined) {
    // TODO  segnalazione errore eventuale
    const personnelName: string[] = [];
    for (let i = 0; i < selectedPersonnel.value.length; i++) {
      personnelName.push(selectedPersonnel.value[i].name);
    }
    const booking = {
      date: dataEventInfo.value.date,
      duration: {
        start: dataEventInfo.value.schedule_start,
        end: dataEventInfo.value.schedule_end,
      },
      ssn: dataUser.value.codice_fiscale,
      venue_id: selectedVenue.value.id,
      personnel_name: personnelName
    };
    axios.post('/api/booking/add', booking, {
      headers: {
        'Content-Type': 'application/json'
      }
    })
    .then(response => {
      console.log('Booking ID:', response.data);
      let bookingId = response.data;
      if (dataUser.value != null && selectedVenue.value != undefined) {
        const newBooking = new Booking(
            bookingId,
            dataUser.value.codice_fiscale,
            dataEventInfo.value.date,
            {start: dataEventInfo.value.schedule_start, end: dataEventInfo.value.schedule_end},
            selectedVenue.value,
            selectedPersonnel.value,
        )
        console.log(dataBooking.value);
        dataBooking.value.push(newBooking);
        console.log(dataBooking.value);
        bookingStore.updateData();
        useDialog('', 'PRENOTAZIONE AVVENUTA CON SUCCESSO\n');
        confetti.addConfetti({
          confettiRadius: 7,
          confettiNumber: 700,
        })
      } else throw new Error('dataUser o selectedVenue non definito!');
    })
    .catch(error => {
      alert('ERRORE PRENOTAZIONE\n');
      console.error('Errore:', error.response ? error.response.data : error.message);
    });
  }
  else{
    console.error("dataUser o selectedVenue non definito!");
  }
}

function keepMapUpdated() {
  watch(
      () => bookingStore.isNotified,
      () => {
        if (bookingStore.isNotified) {
          initializeMarkers();
          bookingStore.isNotified = false;
        }
      }
  );
}
</script>

<template>
  <title>Nuova Prenotazione</title>
  <h1 v-if="dataEventInfo" class="first-content" style="text-align: center;">Luoghi disponibili per evento di tipo "{{dataEventInfo.event_type}}" </h1>
  <article class="disposition">
    <section class="item-disposition">
      <div style="order: 1"></div>
      <h1>Selezionare luogo per evento</h1>
      <input v-model="indirizzo" type="text" name="ricerca" placeholder="Indirizzo da cercare">
      <button id="search-button" @click="findAddress(indirizzo)"><img src="/search.png" alt="cerca" height="20"/></button><br>
      <div ref="mapContainer" id="map"/>
      <div v-if="loadedMarkers < 100" class="progress">
        <div class="progress-bar progress-bar-striped active" role="progressbar" aria-valuenow="40" aria-valuemin="0" aria-valuemax="100" :style="{width: loadedMarkers + '%'}"> <!--  TODO: cambiare aria-valuenow-->
          Caricamento luoghi: {{loadedMarkers.toFixed(1)}}%
        </div>
      </div> 
    </section>
    <section>
      <section class="item-disposition booking-box">
        <div style="order: 2"></div>
          <h1>Informazioni sull'evento</h1>
          <h2>Data: {{dataEventInfo.date}}</h2>
          <h2>Tipo di evento: {{dataEventInfo.event_type}}</h2>
          <h2>Orario di inizio: {{dataEventInfo.schedule_start}}</h2>
          <h2>Orario di fine: {{dataEventInfo.schedule_end}}</h2>
      </section>
      <section class="item-disposition booking-box" v-if="selectedVenue">
        <div style="order: 2"></div>
        <h1 v-if="selectedVenue">{{ selectedVenue.name }}</h1>
        <h2 v-if="selectedVenue">Indirizzo: {{ selectedVenue.address}} </h2>
        <h2 v-if="selectedVenue">Costo orario: {{ selectedVenue.rent_cost}} </h2>
        <div v-if="dataPersonnel.length != 0">
          <label> Selezionare il personale per l'evento :</label>
          <br>
          <form @submit.prevent="bookEvent">
            <div v-for="(option, index) in dataPersonnel.sort((a, b) => {
              // Controlla se il settore e il tipo di evento coincidono
              const aHasPriority = a.sector.includes(dataEventInfo.event_type);
              const bHasPriority = b.sector.includes(dataEventInfo.event_type);
              // Ordina in base al settore
              if (aHasPriority && !bHasPriority) return -1;
              if (!aHasPriority && bHasPriority) return 1;
              return 0;
            })" :key="index">
            <!--div v-for="(option, index) in dataPersonnel" :key="index"-->
              <input type="checkbox" v-model="selectedPersonnel" :value="option"/>
              <span> nome: {{ option.name }}, costo orario: {{ option.hourly_cost }}€, settori: {{ option.sector }}</span>
            </div>
          </form>
        </div>
        <div v-else>
          <p> Nessun personale disponibile per il giorno e ora scelti </p>
        </div>
        <button @click="bookEvent">Prenota</button>
      </section>
    </section>
  </article>
  <dialog ref="modal" id="modal">
    <h2>{{popupTitle}}</h2>
    <p>{{popupMessage}}</p>
    <button class="button" id="close-button" @click="closeDialog">Chiudi</button>
  </dialog>
</template>

<style scoped>
  h1{
    font-size: 2em;
  }
  h2{
    font-size: 1em;
  }

  #map{
    height: 580px; width: 580px;
    border: solid var(--highlight-color) 2px;
    animation: fade-down 0.4s;
  }

  #map:hover{
    box-shadow: 0 2px 20px var(--highlight-color);
    transition: .3s;
  }

  .item-disposition{
    margin: 20px;
  }

  .booking-box{
    border: solid 3px var(--highlight-color);
    background-color: var(--color-background-mute);
    padding: 20px;
    color: var(--color-text);
    animation: fade-up 0.5s;
    width: 60ch;
  }

  .booking-box:hover{
    box-shadow: 0 2px 10px var(--highlight-color);
    transition: .3s;
  }

  .disposition{
    display: flex;
    flex-direction: row;
    align-content: center;
    align-items: flex-start;
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

  canvas.js-confetti {
    z-index: 10 !important;
  }
</style>