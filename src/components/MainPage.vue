<script setup lang="ts">
import JSConfetti from 'js-confetti'
import L from 'leaflet'
import { ref } from 'vue'
import { onMounted } from 'vue';
import axios, { type AxiosResponse} from 'axios';
import 'leaflet/dist/leaflet.css'
import 'leaflet/dist/leaflet.js'
import 'leaflet-control-geocoder/dist/Control.Geocoder.css'
import 'leaflet-control-geocoder/dist/Control.Geocoder.js'
import BackendInteract from '@/components/BackendInteract.vue'
//import {dataVenue} from './BackendInteract.vue';

const confetti = new JSConfetti();
const mapContainer = ref<HTMLElement>();

let map: L.Map;
let indirizzo: string;

const dataVenue = ref<Venue[]>([]);
const markerArray = ref<markerAddress[]>([]);
const printedVenue = ref<Venue>();

interface Cache{
  [key: string]: any; // TODO: capire se funziona address come chiave
}
const cache: Cache = {};

onMounted(async () => {
  await axios.get<Venue[]>("/api/database/ls").then((response: AxiosResponse<Venue[]>) => {
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
});

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
    end: string;
  };
  closingDays: string[];

  constructor(venue:Venue) {
    this.id = venue.id;
    this.name = venue.name;
    this.address = venue.address;
    this.max_capacity = venue.max_capacity;
    this.rent_cost = venue.rent_cost;
    this.weekdayHours = venue.weekdayHours;
    this.weekendHours = venue.weekendHours;
    this.closingDays = venue.closingDays;
  }
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

function bookEvent(){
  confetti.addConfetti({
    confettiRadius: 7,
    confettiNumber: 700,
  })
  alert('PRENOTAZIONE AVVENUTA CON SUCCESSO\n ID prenotazione:')
}

function initializeMap(){ // inizializzazione mappa
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

function initializeMarker(address: string) { // disposizione marker per tutti i luoghi del database
  if(cache[address]){
    console.log(`Caricamento cache per "${address}"`)
    const cachedData = cache[address];
    processMarkerResult(address, cachedData);
    return;
  }
  const cachedData = localStorage.getItem(address);
  if(cachedData){
    console.log(`Caricamento localStorage per "${address}"`);
    const parsedData = JSON.parse(cachedData)
    cache[address] = parsedData;
    processMarkerResult(address, parsedData);
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
    const result = response.data[0];
    cache[address] = result;
    localStorage.setItem(address, JSON.stringify(result));
    processMarkerResult(address, result);
  }).catch (error => {
    const endTime = performance.now();
    console.error('Errore durante la geocodifica:', error); // TODO: se non trova il luogo manca la segnalazione all'utente
    console.log(`Richiesta "${address}" fallita dopo ${(endTime-startTime)/60} secondi`)
  });
}

function processMarkerResult(address:string, result:any){
  const newMarker = new markerAddress(result.lat, result.lon, address);
  markerArray.value.push(newMarker);
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
    console.error('Errore durante la geocodifica:', error); // se non trova il luogo manca la segnalazione all'utente
  });
}

function onMapClick(e: any){
  //map.setView([e.latlng.lat, e.latlng.lng], 30);
  for(let i=0; i < dataVenue.value.length; i++){
    if (e.latlng.lat == markerArray.value[i].latlon.lat) {
      if (e.latlng.lng == markerArray.value[i].latlon.lon) {
        for (let k = 0; k < dataVenue.value.length; k++) {
          if (dataVenue.value[k].address === markerArray.value[i].address) {
            printedVenue.value = dataVenue.value[k];
            break;
          }
        }
      }
    }
  }
}

</script>

<template>
  <!-- Box arancione grande che comprende mappa e prenotazione -->
  <article class="disposition">
    <section class="item-disposition">
      <!-- Box verde che comprende form e mappa -->
      <div style="order: 2"></div>
      <input v-model="indirizzo" type="text" name="ricerca" placeholder="Indirizzo da cercare">
      <button @click="findAddress(indirizzo)">Cerca</button><br> <!-- 44.8328, 11.6178 San Romano -->
      <div ref="mapContainer" id="map"/>
    </section>
    <section class="item-disposition booking-box" v-if="printedVenue">
      <!-- Box azzurra che contiene prenotazione -->
      <div style="order: 3"></div>
      <h1 v-if="printedVenue">{{ printedVenue.name }}</h1>
      <h2 v-if="printedVenue">{{printedVenue.address}}</h2>
      <!--h2 v-if="printedVenue">{{printedVenue.rent_cost}}</h2-->
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
