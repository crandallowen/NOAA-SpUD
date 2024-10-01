<script setup>
import displayTable from '@/components/displayTable.vue';
import { useSearchResultsStore } from '@/stores/searchResults';
</script>

<template>
    <displayTable title="Search Results" :use-store="useSearchResultsStore" />
</template>

<style scoped>

</style>