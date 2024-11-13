import { defineStore } from 'pinia';
import { defaultColumns } from '@/js/utils';
import { ref } from 'vue';

export const useHomeTableStore = defineStore('homeTable', () => {
    const sort = ref({
        column: 'center_frequency',
        direction: 'ascending'
    });
    const displayColumns = ref([...defaultColumns]);
    const filters = ref([]);

    if (localStorage.getItem('homeTable')) {
        let state = JSON.parse(localStorage.getItem('homeTable'));
        sort.value = state.sort;
        displayColumns.value = state.displayColumns;
        filters.value = state.filters;
    }

    function invertSort() {
        sort.value.direction = (sort.value.direction === 'ascending') ? 'descending' : 'ascending';
    };

    return {sort, displayColumns, filters, invertSort};
});