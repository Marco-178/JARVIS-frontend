<script setup lang="ts">
import BackendInteract from '@/components/BackendInteract.vue'
import Header from "@/components/Header.vue";
import Navbar from "@/components/Navbar.vue";
import MainPage from "@/components/MainPage.vue";
</script>


<template>
  <header>
    <h1>Homepage prenotazioni</h1>
    <div class="wrapper">
      <Navbar/>
    </div>
  </header>

  <main>
    <MainPage/>
    <BackendInteract/>
  </main>
</template>


<style scoped>
header {
  line-height: 1.5;
}

@media (min-width: 1024px) {
  header {
    display: flex;
    place-items: center;
    padding-right: calc(var(--section-gap) / 2);
  }

  header .wrapper {
    display: flex;
    place-items: flex-start;
    flex-wrap: wrap;
  }
}
</style>
