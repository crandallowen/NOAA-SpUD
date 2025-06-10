import { useFetch } from './fetch';
import { allColumns } from './utils';

export async function getFilters() {return useFetch(`${window.location.origin}/api/getFilters`)};

export async function getOptions() {return useFetch(`${window.location.origin}/api/getOptions`)};

export async function query(store) {
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
    return useFetch(url);
};

export async function upload(assignmentFile, proposalFile) {
    const separator = '\n----------\n';
    const assignments = await assignmentFile.text();
    const proposals = await proposalFile.text();
    const options = {
        method: 'POST',
        body: `${assignments}${separator}${proposals}`,
        credentials: 'include',
    };
    return useFetch(`${window.location.origin}/api/upload`, options);
};