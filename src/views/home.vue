<script setup>
import displayTable from '@/components/displayTable.vue';
import { useHomeTableStore } from '@/stores/table';
</script>

<template>
    <h1>Home</h1>
    <displayTable title="RFA Table" :use-store="useHomeTableStore" />
</template>