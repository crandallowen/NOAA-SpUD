<script setup>
import displayTable from './displayTable.vue';
import { searchResultsTable } from '@/js/state';
</script>

<template>
    <displayTable title="Search Results" :state="searchResultsTable" />
</template>

<style scoped>

</style>