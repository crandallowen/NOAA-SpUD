<script setup>
import displayTable from '@/components/displayTable.vue';
import { searchResultsState } from '@/js/state';

</script>

<template>
    <displayTable v-bind="searchResultsState" />
</template>

<style scoped>

</style>