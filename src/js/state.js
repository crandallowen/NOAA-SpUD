import { reactive } from 'vue';
import { defaultColumns } from '@/js/utils';

export const homeTable = reactive({
    filters: [],
    sort: {column: 'frequency_khz', direction: 'ascending'},
    displayColumns: [...defaultColumns]
});

export const searchResultsTable = reactive({
    filters: [],
    sort: {column: 'frequency_khz', direction: 'ascending'},
    displayColumns: [...defaultColumns]
});