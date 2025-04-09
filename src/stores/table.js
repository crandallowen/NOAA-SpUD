import { defineStore } from 'pinia';
import { defaultColumns } from '@/js/utils';
import { ref } from 'vue';

const useTableStore = () => {
    const sort = ref({
        column: 'center_frequency',
        direction: 'ascending'
    });
    const displayColumns = ref([...defaultColumns]);
    const filters = ref([]);

    function invertSort() {
        sort.value.direction = (sort.value.direction === 'ascending') ? 'descending' : 'ascending';
    };

    function handleSort(column) {
        if (column === sort.value.column) {
            invertSort();
        } else {
            sort.value.column = column;
            sort.value.direction = 'ascending';
        }
    };

    function clearFilters() {
        filters.value.splice(0);
    };

    return {sort, displayColumns, filters, invertSort, handleSort, clearFilters};
};

export const useHomeTableStore = defineStore('homeTable', () => {
    const store = useTableStore();
    
    if (localStorage.getItem('homeTable')) {
        let state = JSON.parse(localStorage.getItem('homeTable'));
        store.sort.value = state.sort;
        store.displayColumns.value = state.displayColumns;
        store.filters.value = state.filters;
    }

    return {...store};
});

export const useSearchResultsStore = defineStore('searchResults', () => {
    const store = useTableStore();
    const params = ref([]);
    const savedQueries = ref([]);

    if (localStorage.getItem('searchResults')) {
        let state = JSON.parse(localStorage.getItem('searchResults'));
        // store.sort.value = structuredClone(state.sort); //May use in prod, but spread syntax is likey sufficient and faster
        store.sort.value = {...state.sort};
        store.displayColumns.value = [...state.displayColumns];
        store.filters.value = state.filters.map((filter) => {return {...filter}});
        params.value = state.params.map((param) => {return {...param}});
        // savedQueries.value = structuredClone(state.savedQueries); //Object structure is more complicated than above, but may use spread syntax as above if possible
    }

    function removeParam(index) {
        params.value.splice(index, 1);
    };

    function clearParams() {
        params.value.splice(0);
    };

    // function saveQuery(name) {
    //     if (savedQueries.value.some((query) => query.name === name)) {
    //         throw Error('Name already used');
    //     }
    //     savedQueries.value.push({name: name, params: params.value.map((param) => {return {...param}})});
    // };
    
    // function deleteQuery(name) {
    //     if (!savedQueries.value.some((query) => query.name === name)) {
    //         throw Error(`No query with name ${name}`);
    //     }
    //     savedQueries.value.splice(savedQueries.value.findIndex((query) => query.name === name), 1);
    // };

    // function loadQuery(name) {
    //     if (!savedQueries.value.some((query) => query.name === name)) {
    //         throw Error(`No query with name ${name}`);
    //     }
    //     params.value = savedQueries.value.find((query) => query.name === name).map((param) => {return {...param}});
    // };

    // return {...store, params, savedQueries, removeParam, clearParams, saveQuery, deleteQuery, loadQuery};
    return {...store, params, savedQueries, removeParam, clearParams};
});