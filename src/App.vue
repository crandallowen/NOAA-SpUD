<script setup>
import navigation from '@/components/navigation.vue';
// function onSearch() {
//     window.location.href = '#/searchResults'
// }
</script>

<template>
  <header>
    <img alt="Generic logo" class="logo" src="./assets/genericLogo.svg" width="55" height="55" />
    <navigation />
  </header>

  <main>
    <router-view />
  </main>
</template>

<style scoped>
header {
  display: flex;
  place-items: center;
  line-height: 1.5;
  margin: 2rem 1rem;
}

.logo {
  display: block;
  margin: 0 2rem 0 0;
}
</style>
