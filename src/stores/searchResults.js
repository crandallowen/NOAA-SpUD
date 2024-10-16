import { defineStore } from 'pinia';
import { defaultColumns } from '@/js/utils';
import { ref } from 'vue';

export const useSearchResultsStore = defineStore('searchResults', () => {
    const sort = ref({
        column: 'center_frequency',
        direction: 'ascending'
    });
    const displayColumns = ref([...defaultColumns]);
    const params = ref([]);

    if (localStorage.getItem('searchResults')) {
        let state = JSON.parse(localStorage.getItem('searchResults'));
        sort.value = state.sort;
        displayColumns.value = state.displayColumns;
        params.value = state.params;
    }

    function invertSort() {
        sort.value.direction = (sort.value.direction === 'ascending') ? 'descending' : 'ascending';
    };

    return {sort, displayColumns, params, invertSort};
});