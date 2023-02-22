<script setup>
import displayHomeTable from './displayHomeTable.vue'

const props = defineProps({
    rows: Array
});
</script>
<template>
    <h1>Home</h1>
    <displayHomeTable :rows="props.rows"/>
</template>