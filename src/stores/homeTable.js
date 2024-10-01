import { defineStore } from 'pinia';
import { defaultColumns } from '@/js/utils';
import { ref } from 'vue';

export const useHomeTableStore = defineStore('homeTableOptions', () => {
    const sort = ref({
        column: 'center_frequency',
        direction: 'ascending'
    });
    const displayColumns = ref([...defaultColumns]);
    const params = ref([]);

    if(localStorage.getItem('homeTableOptions')){
        var state = JSON.parse(localStorage.getItem('homeTableOptions'));
        sort.value = state.sort;
        displayColumns.value = state.displayColumns;
        params.value = state.params;
    }

    function invertSort() {
        sort.value.direction = (sort.value.direction === 'ascending') ? 'descending' : 'ascending';
    };

    return {sort, displayColumns, params, invertSort};
});