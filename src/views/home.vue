<script setup>
import displayTable from '@/components/displayTable.vue';
import { useHomeTableStore } from '@/stores/table';
</script>

<template>
    <displayTable title="RFA Table" :use-store="useHomeTableStore" />
</template>