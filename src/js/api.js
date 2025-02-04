import { watch } from 'vue';
import { useFetch } from './fetch';
import { useAuthStore } from '@/stores/auth';
import { allColumns } from './utils';

function handle401and403Error(error) {
    const authStore = useAuthStore();
    // console.error(`${error.name}: ${error.message}`);
    authStore.logout();
};

export function getFilters(rowFilters) {
    let url = new URL(`${window.location.origin}/api/getFilters`);
    const {data, error} = useFetch(url);
    watch([data, error], ([filters, error]) => {
        if (error) {
            handle401and403Error(error);
        } else {
            for (const field in filters) {
                for (const i in filters[field]) {
                    rowFilters[field].push({id: field+'Filter'+i, name: filters[field][i], condition: {field: field, value: filters[field][i]}});
                }
            }
        }
    }, {once: true});
};

export function getOptions(options) {
    let url = new URL(`${window.location.origin}/api/getOptions`);
    const {data, error} = useFetch(url);
    watch([data, error], ([data, error]) => {
        if (error) {
            handle401and403Error(error);
        } else {
            options.value = data;
        }
    }, {once: true});
};

export function query(rows, columns, store) {
    document.body.style.cursor='wait';
    let url = new URL(`${window.location.origin}/api/query`);
    let orderedColumns = [];
    if (store.displayColumns.length !== 0)
        allColumns.forEach((column) => {if (store.displayColumns.includes(column)) {orderedColumns.push(column)}});
    else
        allColumns.forEach((column) => {orderedColumns.push(column)});
    orderedColumns.forEach((column) => url.searchParams.append('column', column));
    url.searchParams.append('sortColumn', store.sort.column);
    url.searchParams.append('sortDirection', store.sort.direction);
    let paramsList = [];
    if (Object.hasOwn(store, 'params') && store.params.length !== 0)
        for (const i in store.params)
            paramsList.push(JSON.stringify(store.params[i]));
    if (store.filters.length !== 0)
        for (const i in store.filters)
            paramsList.push(JSON.stringify(store.filters[i]))
    if (paramsList.length !== 0)
        url.searchParams.append('params', `[${paramsList.join(',')}]`);
    const {data, error} = useFetch(url);
    watch([data, error], ([data, error]) => {
        if (error) {
            if (['Unauthorized', 'Forbidden'].includes(error.message))
                handle401and403Error(error);
            else
                console.error(`${error.name}: ${error.message}`);
        } else {
            columns.value = data.columns;
            rows.value = data.rows;
        }
        document.body.style.cursor='default';
    }, {once: true});
};