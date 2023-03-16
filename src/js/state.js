import { reactive } from 'vue';
import { defaultColumns } from '@/js/utils';

export const searchResultsState = reactive({
    title: 'Search Results',
    sortColumn: 'frequency_khz', 
    sortDirection: 'ascending',
    displayColumns: [...defaultColumns],
    params: []
});