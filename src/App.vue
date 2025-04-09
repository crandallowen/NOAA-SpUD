<script setup>
import navigation from '@/components/navigation.vue';
</script>

<template>
    <header>
        <a href="https://noaa.gov"><img alt="NOAA Logo" class="logo" src="./assets/NOAA_logo.svg" width="74" height="74" /></a>
        <div id="topBarContainer">
            <h1>NOAA Spectrum Usage Database</h1>
            <navigation />
        </div>
    </header>
    <main>
        <router-view />
    </main>
</template>

<style scoped>

header {
     display: flex;
     line-height: 1.5;
     padding: 1.5rem 1.5rem 1rem 2rem;
     margin-bottom: 20px;
     background: var(--color-main);
}

#topBarContainer {
    display: flex;
    flex-direction: column;
}

h1 {
    color: var(--color-site-title);
}

main {
    padding: 0 2rem;
}

.logo {
    display: block;
    background-color: var(--vt-c-white);
    border-radius: 37px;
}

a {
    margin: 0 2rem 0 0;
}

</style>
