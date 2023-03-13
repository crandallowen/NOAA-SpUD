<script setup>
import displayTable from './displayTable.vue';
import { searchResultsTable } from '@/js/state';

const props = defineProps({
    params: Object
});
</script>

<template>
    <displayTable title="Search Results" :state="searchResultsTable" :params="props.params" />
</template>

<style scoped>

</style>