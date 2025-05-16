<script setup>
import { useAuthStore } from '@/stores/auth';

const auth = useAuthStore();
</script>

<template>
    <nav class="navigationBar">
        <router-link :to="{name: 'home'}">Home</router-link> 
        <span> | </span>
        <router-link :to="{name: 'search'}">Search</router-link>
        <template v-if="auth.user.canUpload">
            <span> | </span>
            <router-link :to="{name: 'upload'}">Upload</router-link>
        </template>
    </nav>
</template>

<style scoped>
.navigationBar {
    display: flex;
    flex-direction: row;
    width: fit-content;
}

.navigationBar > * {
    padding: 0 4px;
}

a {
  text-decoration: none;
  color: var(--color-navigation);
  transition: 0.4s;
}

@media (hover: hover) {
  a:hover {
    color: var(--color-navigation-hover);
  }
}
</style>
