import { useFetch } from './fetch';
import { useAuthStore } from '@/stores/auth';
import { allColumns } from './utils';

function handleError(error) {
    if (['Unauthorized', 'Forbidden'].includes(error.message))
        handle401and403Error();
    else
        console.error(`${error.name}: ${error.message}`);
};

function handle401and403Error() {useAuthStore().logout();};

export async function getFilters(rowFilters) {
    let url = new URL(`${window.location.origin}/api/getFilters`);
    return useFetch(url)
        .then((filters) => {
            for (const field in filters) {
                for (const i in filters[field]) {
                    rowFilters[field].push({id: field+'Filter'+i, name: filters[field][i], condition: {field: field, value: filters[field][i]}});
                }
            }
        })
        .catch((error) => (handleError(error)))
};

export async function getOptions(options) {
    let url = new URL(`${window.location.origin}/api/getOptions`);
    return useFetch(url)
        .then((data) => {options.value = data;})
        .catch((error) => (handleError(error)));
};

export async function query(rows, columns, store) {
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
    try {
        const data = await useFetch(url);
        columns.value = data.columns;
        rows.value = data.rows;
    } catch (error) {
        return handleError(error);
    }
};