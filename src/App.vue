<script setup lang="ts">
import Navbar from "@/components/AppNavbar.vue";
import BackendInteract from "@/components/BackendInteract.vue"
</script>


<template>
  <header>
    <div class="wrapper">
      <Navbar/>
    </div>
  </header>

  <main>
    <BackendInteract/>
    <router-view v-slot="{ Component }">
      <keep-alive>
        <component :is="Component" />
      </keep-alive>
    </router-view>
  </main>
</template>


<style scoped>
header {
  line-height: 1.5;
}
</style>
