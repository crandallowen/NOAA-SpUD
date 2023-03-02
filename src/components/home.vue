<script setup>
import displayTable from './displayTable.vue';

const props = defineProps({
    rows: Array,
    columns: Array
});
</script>

<template>
    <h1>Home</h1>
    <displayTable title="RFA Table" :columns="props.columns" :rows="props.rows" />
</template>