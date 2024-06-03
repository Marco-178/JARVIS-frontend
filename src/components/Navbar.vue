<script setup lang="ts">

</script>

<template>
  <nav>
    <ul>
      <li><a href="./MainPage.vue">Home</a></li>
      <li><a href="./PrenotationsPage.vue">Prenotazioni</a></li>
    </ul>
  </nav>
</template>

<style scoped>
nav ul {
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