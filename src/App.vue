<script setup>
import { ref, reactive, computed, watchEffect } from 'vue';
import home from './components/home.vue';
import search from './components/search.vue';
import notFound from './components/notFound.vue';
import navigation from './components/navigation.vue';
import searchResults from './components/searchResults.vue';

const routes = {
    '/': home,
    '/search': search,
    '/searchResults': searchResults
};

const currentPath = ref(window.location.hash);

window.addEventListener('hashchange', () => {
    currentPath.value = window.location.hash
});

const currentView = computed(() => {
    return routes[currentPath.value.slice(1) || '/'] || notFound
});

// const currentProperties = computed (() => {
//     if (currentView.value.__name == 'searchResults') {
//         return {};
//     } else 
//         return {};
// });

function onSearch() {
    window.location.href = '#/searchResults'
}
</script>

<template>
  <header>
    <img alt="Generic logo" class="logo" src="./assets/genericLogo.svg" width="55" height="55" />
    <navigation>
        <template #home>
            <a href="#/">Home</a>
        </template>
        <template #search>
            <a href="#/search">Search</a>
        </template>
    </navigation>
  </header>

  <main>
    <KeepAlive exclude="searchResults">
        <component :is="currentView" @search="onSearch" />
    </KeepAlive>
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
