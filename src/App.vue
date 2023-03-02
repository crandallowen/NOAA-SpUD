<script setup>
import { ref, reactive, computed } from 'vue';
import { request } from '@/js/utils';
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

const currentProperties = computed (() => {
    if (currentView.value.__name == 'home') {
        return {rows: rows.value, columns: columns.value};
    } else if (currentView.value.__name == 'search') {
        return {bureaus: bureaus.value, columns: columns.value};
    } else 
        return {};
});

const rows = ref([]);
const columns = ref([]);
const bureaus = ref([]);

function onSearch(query) {
    console.log(query);
}

request({method: 'GET', url: 'getRFAs'})
    .then((responseJSON) => {
        let response = JSON.parse(responseJSON);
        response.rows.forEach((row) => {
            rows.value.push(reactive(row));
        });
        response.columns.forEach((column) => {
            columns.value.push(column.name);
            // console.log(column.name);
        });
    })
    .catch((error) => {
        console.error(error);
    })
    // .finally(() => {
    //     console.log(rows);
    //     console.log(headers);
    // })

request({method: 'GET', url: 'getBureaus'})
    .then((responseJSON) => {
        let response = JSON.parse(responseJSON);
        response.rows.forEach((row) => {
            bureaus.value.push(row.bureau);
        });
    })
    .catch((error) => {
        console.error(error);
    })
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
    <component :is="currentView" v-bind="currentProperties" @search="onSearch" />
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
