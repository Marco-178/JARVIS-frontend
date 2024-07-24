<script setup lang="ts">
import JSConfetti from 'js-confetti'
import L from 'leaflet'
import { ref} from 'vue'
import { onMounted } from 'vue';
import axios, { type AxiosResponse} from 'axios';
import 'leaflet/dist/leaflet.css'
import 'leaflet/dist/leaflet.js'
import BackendInteract from '@/components/BackendInteract.vue'
import { Venue, Booking, Personnel, EventInfo } from '@/types'
import "https://ajax.googleapis.com/ajax/libs/jquery/3.7.1/jquery.min.js";
import "https://maxcdn.bootstrapcdn.com/bootstrap/3.4.1/js/bootstrap.min.js";

const confetti = new JSConfetti();
const mapContainer = ref<HTMLElement>();

let map: L.Map;
let indirizzo: string;

const dataVenue = ref<Venue[]>([]);
const dataBooking = ref<Booking[]>([]);
const dataPersonnel = ref<Personnel[]>([]);
const dataEventInfo = ref<EventInfo>(new EventInfo( 2, 'matrimonio', '2024-08-01', '11:00:00', '14:00:00', 100));
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

interface Cache{
  markers: { [address: string]: any };
  bookings: { [id: string]: any };
}

const cache: Cache = { // TODO impostare TTL?
  markers: {},
  bookings: {},
};

onMounted(async () => {
  await axios.get<EventInfo>("/api/callREST/getEvent").then((response: AxiosResponse<EventInfo>) => {
    console.log("Risposta da Axios:", response);
    console.log("Dati ricevuti:", response.data);
    // è una soluzione semplice ma non scalabile quindi forse è meglio fare un confronto degli attributi
    if('event_type' in response.data){
      dataEventInfo.value = response.data;
      console.log(dataEventInfo);
      console.log("EventInfo aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa", dataEventInfo.value);
    } else {
      console.log("Unknown Object", response.data)
    }
  }).catch(error => {
    console.error("Errore durante la richiesta Axios:", error);
  });
  console.log("AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA", dataEventInfo);
  // TODO 1: sintetizzare questa chiamata in una funzione e spostare in backend
  await axios.get<Venue[]>("/api/venue/available?date=" + dataEventInfo.value.date + "&start=" + dataEventInfo.value.schedule_start + "&end=" + dataEventInfo.value.schedule_end).then((response: AxiosResponse<Venue[]>) => { // TODO 2: utilizzare available al posto di ls
    console.log("Risposta da Axios: ", response);
    console.log("Dati ricevuti: ", response.data);
    // è una soluzione semplice ma non scalabile quindi forse è meglio fare un confronto degli attributi
    response.data.forEach(item => {
      if ('address' in item) {
        const newVenue = new Venue(item.id, item.name, item.address, item.max_capacity, item.rent_cost, item.weekdayHours, item.weekendHours, item.closingDays, item.booking);
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
  getPersonnel("intrattenimento", "2050:08:01", "15:30:00", "16:00:00"); //TODO prendere i parametri da REST
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
    console.error('Errore durante la geocodifica:', error);
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

function updateGeocodingStatusBar(){
  loadedMarkers.value = (markerArray.value.length) / (dataVenue.value.length) * 100;
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
  // TODO: controllo per posti già prenotati nella prenotazione precedente? FARE COMPONENTE A PARTE PER EVITARE RERENDERING
  confetti.addConfetti({
    confettiRadius: 7,
    confettiNumber: 700,
  })
  if(selectedVenue.value != undefined) { // assicuro Typescript che non sia undefined
    if(selectedPersonnel.value != undefined) {
      const newBooking = new Booking(
          -1, // placeholder, in lettura il vero id viene recuperato dal DB e in scrittura sul backend mandiamo un oggetto senza id
          "NNNMRC02M01D548F",
          dataEventInfo.value.date, // TODO mettere data e ora passate da EventInfo
          {start: dataEventInfo.value.schedule_start, end: dataEventInfo.value.schedule_end},
          selectedVenue.value,
          selectedPersonnel.value,
      )
      dataBooking.value.push(newBooking);
      console.log(dataBooking)
      cache.bookings[newBooking.id] = newBooking; // TODO rimuovere forse i caching delle prenotazioni
      localStorage.setItem('dataBooking', JSON.stringify(dataBooking.value));
      alert('PRENOTAZIONE AVVENUTA CON SUCCESSO\n');
    }
    else{
      console.error("selectedPersonnel non definita!")
    }
  }
  else{
    console.error("selectedVenue non definito!")
  }
}

function getPersonnel(event_type:string, date:string, schedule_start:string, schedule_end:string){
  let url = "/api/personnel/available?sectors=intrattenimento&date=2050-03-24&start=14:00:00&end=18:00:00"
  //let url = "/api/personnel/ls";
  //let url = "/api/personnel/available?sectors=" + event_type + "&date=" + date + "&start=" + schedule_start + "&end=" + schedule_end;
  console.log(url);
  axios.get<Personnel[]>(url).then((response: AxiosResponse<Personnel[]>) => { // TODO rifare quando verranno implementati i servizi REST sul backend
    console.log("Risposta da Axios: ", response);
    console.log("Dati ricevuti: ", response.data);
    // è una soluzione semplice ma non scalabile quindi forse è meglio fare un confronto degli attributi
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
  }).catch(error => {
    console.error("Errore durante la richiesta Axios: ", error);
  });
}

</script>

<template>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.4.1/css/bootstrap.min.css">
  <title>Home</title>
  <article class="disposition">
    <section class="item-disposition">
      <div style="order: 2"></div>
      <input v-model="indirizzo" type="text" name="ricerca" placeholder="Indirizzo da cercare">
      <button @click="findAddress(indirizzo)">Cerca</button><br>
      <div ref="mapContainer" id="map"/>
      <div v-if="loadedMarkers < 100" class="progress">
        <div class="progress-bar progress-bar-striped active" role="progressbar" aria-valuenow="40" aria-valuemin="0" aria-valuemax="100" :style="{width: loadedMarkers + '%'}">
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
        <p> Nessun personale disponibile per il giorno e ora scelti </p> <!-- TODO per sveva: da EventInfo ci serve {{date}}, orario: {{schedule_start}}, {{schedule_end}} -->
      </div>
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
