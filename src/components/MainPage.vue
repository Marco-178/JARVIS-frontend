<script setup lang="ts">
import JSConfetti from 'js-confetti'
import L from 'leaflet'

const confetti = new JSConfetti();

function prenotations(){
  console.log("Funziona :)")
}

function prenota(){
  confetti.addConfetti({
    confettiRadius: 7,
    confettiNumber: 700,
  })
  alert('PRENOTAZIONE AVVENUTA CON SUCCESSO\n ID prenotazione:')
}

var map: L.Map;

function initializeMap(){
  map = L.map('map').setView([44.838215, 11.619852], 13);
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
  }).addTo(map);
  var marker = L.marker([44.838215, 11.619852]).addTo(map);
  marker.on('click', onMapClick)
}

function findAddress(x: number, y: number){
  map.setView([x, y], 30);
}

function onMapClick(e: any){
    alert("You clicked the map at " + e.latlng);
  }
</script>

<template>
  <header>
    <h1>Homepage prenotazioni</h1>
  </header>
  <!-- Box arancione grande che comprende mappa e prenotazione -->
  <button @click="prenotations">Gestione prenotazioni</button>
  <section class="disposition">
    <section class="itemdisposition">
      <!-- Box verde che comprende form e mappa -->
      <div style="order: 2"></div>
      <input type="text" name="ricerca" placeholder="Luogo da cercare">
      <button @click="findAddress(44.8328, 11.6178)">Cerca</button><br>
      <div id="map">
        <button @click="initializeMap">Mappa</button>
      </div>
    </section>
    <section class="itemdisposition prenotationbox">
      <!-- Box azzurra che contiene prenotazione -->
      <div style="order: 3"></div>
      <h1>Informazioni luogo</h1>
      <button @click="prenota">Prenota</button>
    </section>
  </section>
  <aside>
    <!-- Box rosso che comprende prenotazioni effettuate -->
  </aside>
</template>

<style scoped>
  #map{height: 580px;width: 580px;}

  .itemdisposition{
    margin: 20px;
  }

  .prenotationbox{
    background-color: lightgrey;
    padding: 20px;
  }

  .disposition{
    display: flex;
    flex-direction: row;
    align-content: center, space-between;
    align-items: flex-start;
    padding: 20px;
  }
</style>
