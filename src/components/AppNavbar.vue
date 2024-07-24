<script setup lang="ts">

</script>

<template>
  <nav>
    <ul>
      <li>
        <router-link to="/"><a>Prenotazioni</a></router-link>
      </li>
      <li>
        <router-link to="/prenotations"><a>Nuova prenotazione</a></router-link>
      </li>
    </ul>
  </nav>
</template>

<style scoped>
nav ul { /* TODO: quando si fa click un un link deve rimanere "cliccato" il box (cioè rimane evidenziato e il testo sottolineato ad esempio) */
  list-style: none;
  padding:0;
  margin:0;
  background-color:#f2f2f2;
}

nav ul li {
  display: inline-block;
}

nav ul li a {
  display: block;
  padding:10px 20px;
  color: #333;
  text-decoration: none;
}

nav ul li:hover {
  background-color: #ddd;
}

nav ul li:hover > ul {
  display: block;
}
</style>