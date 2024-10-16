<template>
    <nav class="navigationBar">
        <router-link :to="{name: 'home'}">Home</router-link> 
        <span> | </span>
        <router-link :to="{name: 'search'}">Search</router-link>
    </nav>
</template>

<style scoped>
.navigationBar {
    display: flex;
    flex-direction: row;
}
.navigationBar > * {
    margin: 2rem auto 0;
    padding: 0 4px;
}
</style>
