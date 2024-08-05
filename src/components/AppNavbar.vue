<script setup lang="ts">
  const button = document.getElementById('')
</script>

<template>
  <nav>
    <ul>
      <li>
        <router-link to="/" active-class="active-link">Prenotazioni</router-link>
      </li>
      <li>
        <router-link to="/bookings" active-class="active-link">Nuova prenotazione</router-link>
      </li>
    </ul>
    <!-- TODO: night mode button -->
  </nav>
</template>

<style scoped>
nav ul {
  list-style: none;
  padding:0;
  margin:0;
  background-color: var(--navbar-bg);
}

nav ul li {
  display: inline-block;
}

nav ul li a {
  display: block;
  padding:10px 20px;
  color: var(--navbar-text-color);
}

.active-link{
  background-color: var(--highlight-button-active);
  font-weight: 700;
  transition: filter .2s;
}

/*nav ul li a:active {
  color: var(--highlight-color);
}*/

nav ul li:active {
  transform: translateY(2px);
}

nav ul li:hover {
  background-color: var(--highlight-button-hover);
}

nav ul li:hover > ul {
  display: block;
}
</style>