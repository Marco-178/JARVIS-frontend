<script setup lang="ts">
import JSConfetti from 'js-confetti'
import L from 'leaflet'
import { ref, inject } from 'vue'
import { onMounted } from 'vue';
import axios, { type AxiosResponse} from 'axios';
import 'leaflet/dist/leaflet.css'
import 'leaflet/dist/leaflet.js'
import BackendInteract from '@/components/BackendInteract.vue'
import { Venue, Booking, Personnel} from '@/types'

const confetti = new JSConfetti();
const mapContainer = ref<HTMLElement>();

let map: L.Map;
let indirizzo: string;

const dataVenue = ref<Venue[]>([]);
const dataBooking = ref<Booking[]>([]);
const markerArray = ref<markerAddress[]>([]);
const selectedVenue = ref<Venue>(); // TODO cambiare selectedVenue in selectedVenue
const loadedMarkers = ref<number>(0);

const dataPersonnel = inject('dataPersonnel', null);
if (!dataPersonnel) {
  console.error("Failed to inject 'dataPersonnel'");
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

interface Cache{
  markers: { [address: string]: any };
  bookings: { [id: string]: any }; // TODO: capire se funziona address come chiave
}

const cache: Cache = {
  markers: {},
  bookings: {},
};

onMounted(async () => {
  await axios.get<Venue[]>("/api/venue/ls").then((response: AxiosResponse<Venue[]>) => { // TODO sintetizzare questa chiamata in una funzione
    console.log("Risposta da Axios: ", response);
    console.log("Dati ricevuti: ", response.data);
    // TODO: è una soluzione semplice ma non scalabile quindi forse è meglio fare un confronto degli attributi
    response.data.forEach(item => {
      if ('address' in item) {
        const newVenue = new Venue(item);
        console.log(newVenue);
        dataVenue.value.push(newVenue);
        console.log("Venue", dataVenue.value);
      } else {
        console.log("Unknown Object", response.data);
      }
    });
  }).catch(error => {
    console.error("Errore durante la richiesta Axios: ", error);
  });
  initializeMap();
  loadBookings();
});

function initializeMap(){
  if(mapContainer.value){
    map = L.map(mapContainer.value,{
      center: [44.838215, 11.619852],
      zoom: 13,
      zoomControl: false,
    });
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);
  }
  for(let i=0; i < dataVenue.value.length; i++){
    initializeMarker(dataVenue.value[i].address);
  }
}

function initializeMarker(address: string) { // disposizione del marker per l'indirizzo corrispondente
  if(cache.markers[address]){
    console.log(`Caricamento cache per "${address}"`)
    const cachedData = cache.markers[address];
    createMarker(address, cachedData);
    return;
  }
  const cachedData = localStorage.getItem(address);
  if(cachedData){
    console.log(`Caricamento localStorage per "${address}"`); // può essere che metta due volte il marker se è salvato sia su cache che su localStorage (mettere un controllo?)
    const parsedData = JSON.parse(cachedData)
    cache.markers[address] = parsedData;
    createMarker(address, parsedData);
    return;
  }
  const startTime = performance.now();
  axios.get(
    'https://nominatim.openstreetmap.org/search',
    {
      params: {
        q: address,
        format: 'json'
      },
    }
  ).then((response) =>{
    const endTime = performance.now();
    console.log(`Richiesta "${address}" terminata con successo in ${(endTime-startTime)/60} secondi`)
    const bestResult = response.data[0];
    cache.markers[address] = bestResult;
    localStorage.setItem(address, JSON.stringify(bestResult));
    createMarker(address, bestResult);
  }).catch (error => {
    const endTime = performance.now();
    console.error('Errore durante la geocodifica:', error); // TODO: se non trova il luogo manca la segnalazione all'utente
    console.log(`Richiesta "${address}" fallita dopo ${(endTime-startTime)/60} secondi`)
  });
}

function createMarker(address:string, result:any){
  const newMarker = new markerAddress(result.lat, result.lon, address);
  markerArray.value.push(newMarker);
  updateGeocodingStatusBar();
  let marker = L.marker([result.lat, result.lon]).addTo(map).bindPopup(result.display_name);
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

function updateGeocodingStatusBar(){ // TODO creare grafica loading bar e caricarla nel template
  loadedMarkers.value = dataVenue.value.length - (dataVenue.value.length - markerArray.value.length);
}

function loadBookings(){
  console.log("cache.bookings: ", cache.bookings)
  for(const key in cache.bookings){ //  if (hasOwnProperty.call(cache.bookings, key)) per escludere proprietà ereditate (??)
    console.log(`Caricamento cache per prenotazione id."${key}"`)
    dataBooking.value.push(cache.bookings[key]);
  }
  const savedBookings = localStorage.getItem('dataBooking');
  if (savedBookings) {
    console.log('Caricamento localStorage per prenotazioni');
    dataBooking.value = JSON.parse(savedBookings);
  }
}

function bookEvent(){
  // TODO: controllo per posti già prenotati nella prenotazione precedente?
  confetti.addConfetti({
    confettiRadius: 7,
    confettiNumber: 700,
  })
  if(selectedVenue.value != undefined) { // assicuro Typescript che non sia undefined
    const newBooking = new Booking(
        dataBooking.value.length + 1,// TODO id da prelevare da una chiamata apposita axios al DB
        "2024.04.25", // TODO mettere data passata da EventInfo
        {start: "08:00:00", end: "12:00:00"},
        selectedVenue.value,
        new Personnel( // TODO prendere personale da DB??? o da utente??? Boh
            "gigi spa",
            3,
            {start: "08:00:00", end: "12:00:00"},
            {start: "08:00:00", end: "12:00:00"},
            ["gigi"],
        )
    )
    dataBooking.value.push(newBooking);
    cache.bookings[newBooking.id] = newBooking;
    localStorage.setItem('dataBooking', JSON.stringify(dataBooking.value));
    alert('PRENOTAZIONE AVVENUTA CON SUCCESSO\n ID prenotazione:' + dataBooking.value[dataBooking.value.length - 1].id); // basterebbe anche newBooking.id ma teniamo così siamo sicuri che mette nell'array
  }
  else{
    console.error("selectedVenue non definito!")
  }
}

</script>

<template>
  <article class="disposition">
    <section class="item-disposition">
      <div style="order: 2"></div>
      <input v-model="indirizzo" type="text" name="ricerca" placeholder="Indirizzo da cercare">
      <button @click="findAddress(indirizzo)">Cerca</button><br>
      <div ref="mapContainer" id="map"/>
    </section>
    <section class="item-disposition booking-box" v-if="selectedVenue">
      <div style="order: 3"></div>
      <h1 v-if="selectedVenue">{{ selectedVenue.name }}</h1>
      <h2 v-if="selectedVenue">{{ selectedVenue.address}} </h2>
      {{dataBooking.length}}
      <!--h2 v-if="selectedVenue">{{selectedVenue.rent_cost}}</h2-->
      <button @click="bookEvent">Prenota</button>
    </section>
  </article>
  <br><br>
  <BackendInteract/>
</template>

<style scoped>
  #map{height: 580px; width: 580px;}

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
    background-color: lightgrey;
    padding: 20px;
  }

  .disposition{
    display: flex;
    flex-direction: row;
    align-content: center;
    align-items: flex-start;
    padding: 20px;
  }
</style>
