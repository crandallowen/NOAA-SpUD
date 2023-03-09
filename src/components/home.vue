<script setup>
import { ref, reactive, computed, watch } from 'vue';
import displayTable from './displayTable.vue';
import { rowFilters, frequencyFilters } from '@/js/utils';
import { homeTable } from '@/js/state';

</script>

<template>
    <h1>Home</h1>
    <displayTable title="RFA Table" :state="homeTable"/>
</template>