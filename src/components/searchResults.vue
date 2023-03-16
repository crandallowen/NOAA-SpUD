<script setup>
import displayTable from './displayTable.vue';
import { searchResultsState } from '@/js/state';

// const props = defineProps({
//     state: Object,
//     params: Array
// });
</script>

<template>
    <displayTable v-bind="searchResultsState" />
</template>

<style scoped>

</style>