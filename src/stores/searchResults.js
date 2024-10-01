import { defineStore } from 'pinia';
import { defaultColumns } from '@/js/utils';
import { ref } from 'vue';

export const useSearchResultsStore = defineStore('searchResultsOptions', () => {
    const sort = ref({
        column: 'center_frequency',
        direction: 'ascending'
    });
    const displayColumns = ref([...defaultColumns]);
    const params = ref([]);
    function invertSort() {
        sort.value.direction = (sort.value.direction === 'ascending') ? 'descending' : 'ascending';
    };

    return {sort, displayColumns, params, invertSort};
});