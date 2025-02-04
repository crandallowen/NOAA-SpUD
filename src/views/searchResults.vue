<script setup>
import displayTable from '@/components/displayTable.vue';
import { useSearchResultsStore } from '@/stores/table';
</script>

<template>
    <displayTable title="Search Results" :use-store="useSearchResultsStore" />
</template>

<style scoped>

</style>