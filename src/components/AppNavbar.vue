<script setup lang="ts">
  import {ref, onMounted, watch} from 'vue';
  const isDarkThemeChecked = ref(false);

  const detectSystemTheme = () => {
    const prefersDarkScheme = window.matchMedia("(prefers-color-scheme: dark)");
    isDarkThemeChecked.value = prefersDarkScheme.matches;
  };

  onMounted(() => {
    detectSystemTheme();
    window.matchMedia("(prefers-color-scheme: dark)").addEventListener('change', detectSystemTheme);
  });

  watch(isDarkThemeChecked, (newVal) => {
    if (newVal) {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.setAttribute('data-theme', 'light');
    }
  });
</script>

<template>
  <nav>
    <ul>
      <li>
        <router-link to="/" active-class="active-link">Nuova prenotazione</router-link>
      </li>
      <li>
        <router-link to="/bookings" active-class="active-link">Prenotazioni effettuate</router-link>
      </li>
      <li class="theme-button-switch">
        <input type="checkbox" id="theme-toggle" class="theme-button" v-model="isDarkThemeChecked">
        <span class="theme-button-container"/>
        <label for="theme-toggle">Cambio tema</label>
        <span class="animateBg"/>
      </li>
    </ul>
  </nav>
</template>

<style scoped>
nav ul {
  list-style: none;
  padding:0;
  margin:0;
  background-color: var(--navbar-bg);
  width: 100%;

}

nav ul li {
  display: inline-block;
}

nav ul li a {
  display: block;
  padding:10px 20px;
  color: var(--navbar-text-color);
}

nav ul li:active {
  transform: translateY(2px);
}

nav ul li:hover {
  background-color: var(--highlight-button-hover);
}

nav ul li:hover > ul {
  display: block;
}

.theme-button {
  display: none;
}

.theme-button-switch {
  display: inline-flex;
  align-items: center;
  width: 5em;
  height: 1.5em;
  border-radius: 10em;
  user-select: none; /* Impedisce la selezione del testo */
  transition: background-color 0.3s;
  box-shadow: 0 8px 40px hsla(0, 0%, 0%, .2);
  background-color: #fff;
}

.theme-button-container{
  width: 100%;
  height: 100%;

  display: flex;
  justify-content: center;
  align-items: center;
}

.animateBg{
  position: fixed;
  width: 200%;
  height: 100vh;
  z-index: -3;
  clip-path: circle(0% at 0% 0%);
  transition: 0.5s ease-out;
  top: 0;
  left: 0;
}

input:checked ~ .animateBg {
  clip-path: circle(100% at 0% 0%);
}
</style>