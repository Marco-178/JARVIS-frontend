<script setup lang="ts">
import JSConfetti from 'js-confetti'
import L from 'leaflet'
import { ref } from 'vue'
import { onMounted } from 'vue';
import axios from 'axios';
import 'leaflet/dist/leaflet.css'
import 'leaflet/dist/leaflet.js'
import Geocoder from 'leaflet-control-geocoder';
import 'leaflet-control-geocoder/dist/Control.Geocoder.css'
import 'leaflet-control-geocoder/dist/Control.Geocoder.js'

const confetti = new JSConfetti();
let mapContainer = ref<HTMLElement>();

let map: L.Map;

onMounted(initializeMap);

function showBookings(){
  console.log("Funziona :)")
}

function bookEvent(){
  confetti.addConfetti({
    confettiRadius: 7,
    confettiNumber: 700,
  })
  alert('PRENOTAZIONE AVVENUTA CON SUCCESSO\n ID prenotazione:')
}

function initializeMap(){
  if(mapContainer.value){
    map = L.map(mapContainer.value).setView([44.838215, 11.619852], 13);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);
  }
}

function findAddress(address: string) {
  axios.get(
        'https://nominatim.openstreetmap.org/search',
        {
            params: {
              q: address,
              format: 'json'
            }
        }
    ).then((response) =>{
    const { lat, lon } = response.data[0];
    console.log('Coordinate:', lat, lon);
  }).catch (error => {
    console.error('Errore durante la geocodifica:', error);
  });
  let marker = L.marker([44.838215, 11.619852]).addTo(map);
  marker.on('click', onMapClick)
}
//map.setView([lat, lon], 30);

function findAddressV2(){
  const geocoder = new Geocoder({
    defaultMarkGeocode: false
  }).addTo(map);
  geocoder.on('markgeocode', (e: any) => {
    const center = e.geocode.center;
    L.marker(center).addTo(map)
        .bindPopup(e.geocode.name)
        .openPopup();
  })
}


function onMapClick(e: any){
    alert("You clicked the map at " + e.latlng);
  }
</script>

<template>
  <!-- Box arancione grande che comprende mappa e prenotazione -->
  <button @click="showBookings">Gestione prenotazioni</button>
  <article class="disposition">
    <section class="item-disposition">
      <!-- Box verde che comprende form e mappa -->
      <div style="order: 2"></div>
      <input type="text" name="ricerca" placeholder="Luogo da cercare">
      <button @click="findAddress('San Romano, Ferrara')">Cerca</button><br> <!-- 44.8328, 11.6178 San Romano -->
      <button @click="findAddressV2()">CercaV2</button><br> <!-- 44.8328, 11.6178 San Romano -->
      <div ref="mapContainer" id="map"/>
    </section>
    <section class="item-disposition booking-box">
      <!-- Box azzurra che contiene prenotazione -->
      <div style="order: 3"></div>
      <h1>Informazioni luogo</h1>
      <button @click="bookEvent">Prenota</button>
    </section>
  </article>
  <aside>
    <!-- Box rosso che comprende prenotazioni effettuate -->
  </aside>
</template>

<style scoped>
  #map{height: 580px;width: 580px;}

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
    align-content: space-between;
    align-items: flex-start;
    padding: 20px;
  }
</style>
