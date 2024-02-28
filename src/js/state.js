import { reactive } from 'vue';
import { defaultColumns } from '@/js/utils';

export const searchResultsState = reactive({
    title: 'Search Results',
    sortColumn: 'center_frequency', 
    sortDirection: 'ascending',
    displayColumns: [...defaultColumns],
    params: []
});