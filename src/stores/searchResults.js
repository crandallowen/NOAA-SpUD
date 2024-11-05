import { defineStore } from 'pinia';
import { defaultColumns } from '@/js/utils';
import { ref } from 'vue';

export const useSearchResultsStore = defineStore('searchResults', () => {
    const sort = ref({
        column: 'center_frequency',
        direction: 'ascending'
    });
    const displayColumns = ref([...defaultColumns]);
    const params = ref({});
    const filters = ref([]);
    const savedQueries = ref([]);

    if (localStorage.getItem('searchResults')) {
        let state = JSON.parse(localStorage.getItem('searchResults'));
        // sort.value = structuredClone(state.sort); //May use in prod, but spread syntax is likey sufficient and faster
        sort.value = {...state.sort};
        displayColumns.value = [...state.displayColumns];
        params.value = {...state.params};
        filters.value = state.filters.map((filter) => {return {...filter}});
        savedQueries.value = structuredClone(state.savedQueries); //Object structure is more complicated than above, but may use spread syntax as above if possible
    }

    function invertSort() {
        sort.value.direction = (sort.value.direction === 'ascending') ? 'descending' : 'ascending';
    };

    function saveQuery(name) {
        if (savedQueries.value.some((query) => query.name === name)) {
            throw Error('Name already used');
        }
        savedQueries.value.push({name: name, params: {...params}});
    };
    
    function deleteQuery(name) {
        if (!savedQueries.value.some((query) => query.name === name)) {
            throw Error(`No query with name ${name}`);
        }
        savedQueries.value.splice(savedQueries.value.findIndex((query) => query.name === name), 1);
    };

    function loadQuery(name) {
        if (!savedQueries.value.some((query) => query.name === name)) {
            throw Error(`No query with name ${name}`);
        }
        params.value = {...savedQueries.value.find((query) => query.name === name)};
    };

    return {sort, displayColumns, params, filters, savedQueries, invertSort, saveQuery, deleteQuery, loadQuery};
});