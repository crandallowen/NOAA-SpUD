<script setup>
import { ref, reactive, watch, watchEffect, onBeforeMount, onBeforeUpdate, onUpdated } from 'vue';
import { format, headerMap, visibleColumnGroups, allColumns, frequencyFilters, frequencyHzTokHz } from '@/js/utils';
import collapsibleGroup from '@/components/collapsibleGroup.vue';
import { useAuthStore } from '@/stores/auth';
import router from '@/router';

const props = defineProps({
    title: String,
    useStore: Function,
});

const columns = ref(null);
const rows = ref(null);
const auth = useAuthStore();
const store = props.useStore();

watch(store, (store) => {
    localStorage.setItem(store.$id, JSON.stringify(store))
}, {deep: true});

const rowFilters = reactive({
    'center_frequency': frequencyFilters,
    'bureau': [],
    'function_identifier': [],
    'tx_state_country_code': []
});

watchEffect(async () => {
    let url = new URL(`${window.location.origin}/api/getFilters`);
    const response = await fetch(url, {credentials: 'include'})
    if ([401, 403].includes(response.status)) {
        auth.returnURL = router.currentRoute.value.fullPath;
        router.push('/login');
    } else {
        response.json()
            .then((response) => {
                for (const field in rowFilters) {
                    for (const i in response[field]) {
                        rowFilters[field].push({id: field+'Filter'+i, name: response[field][i], condition: {field: field, value: response[field][i]}});
                    }
                }
            })
    }
});

watchEffect(async () => {
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
    const response = await fetch(url, {credentials: 'include'});
    if ([401, 403].includes(response.status)) {
        document.body.style.cursor='default';
        auth.returnURL = router.currentRoute.value.fullPath;
        router.push('/login');
    } else {
        response.json()
            .then((response) => {
                columns.value = response.columns;
                rows.value = response.rows;
            });
        document.body.style.cursor='default';
    }
});

function handleSort(column) {
    if (column === store.sort.column) {
        store.invertSort();
    } else {
        store.sort.column = column;
        store.sort.direction = 'ascending';
    }
    console.log('Sort rows by', store.sort.column, 'in', store.sort.direction, 'order');
};

function downloadCSVData() {
    let csv = `${columns.value.map((col) => headerMap(col)).join(',')}\n`;
    rows.value.forEach((row) => {
        let temp = []
        for (const [key, value] of Object.entries(row)) {
            if (Array.isArray(value))
                temp.push(value.join('|'));
            else if (key.includes('date'))
                temp.push(format(value, key));
            else if (key === 'center_frequency')
                temp.push(frequencyHzTokHz(value));
            else
                temp.push(value);
        };
        csv += `${temp.join()}\n`;
    });
    const anchor = document.createElement('a');
    anchor.href = `data:text/csv;charset=utf-8,${encodeURIComponent(csv)}`;
    anchor.target = '_blank';
    anchor.download = `${props.title}.csv`;
    anchor.click();
};
</script>

<template>
    <div class="tableWithSelects">
        <!-- Side Bar -->
        <div class="columnSelect">
            <span class="titleBar">
                <h2 class="filterHeader">Filters</h2>
                <button id="clearFiltersButton" @click="store.clearFilters()">Clear</button>
            </span>
            <template v-for="key in Object.keys(rowFilters)">
                <collapsibleGroup :group-name="headerMap(key)" collapsed>
                    <template v-for="filter in rowFilters[key]">
                        <div class="inputLine">
                            <input type="checkbox" :id="filter.id" :value="filter.condition" v-model="store.filters">
                            <label :for="filter.id">{{ filter.name }}</label>
                        </div>
                    </template>
                </collapsibleGroup>
            </template>
            <h2>Column Select</h2>
            <template v-for="key in Object.keys(visibleColumnGroups)">
                <collapsibleGroup :group-name="key">
                    <template v-for="column in visibleColumnGroups[key]">
                        <div class="inputLine">
                            <input type="checkbox" :id="column" :value="column" v-model="store.displayColumns">
                            <label :for="column">{{ headerMap(column) }}</label>
                        </div>
                    </template>
                </collapsibleGroup>
            </template>
        </div>
        <!-- Table -->
        <div class="tableContainer">
            <div class="titleBar">
                <h2 class="title">{{ props.title }}</h2>
                <button type="button" id="exportButton" @click="downloadCSVData">Export to .csv</button>
                <p id="rowCount">{{ rows !== null ? `${Object.keys(rows).length} result${Object.keys(rows).length == 1 ? '' : 's'}` : ''}}</p>
            </div>
            <table class="displayTable">
                <thead>
                <tr>
                    <template v-for="value in columns">
                        <th @click="handleSort(value)">
                            <div class="headerBox">
                                {{ headerMap(value) }}
                                <button @click.stop="handleSort(value)" class="sortButton">
                                    {{ store.sort.column != value ? '\u25B2/\u25BC' : (store.sort.direction === 'ascending' ? '\u25B2' : '\u25BC') }} <!--Will need to handle changing the displayed sort direction until after data has loaded in new order-->
                                </button>
                            </div>
                        </th>
                    </template>
                </tr>
                </thead>
                <tbody>
                <tr v-for="row in rows">
                    <template v-for="(value, key) in row">
                        <td>
                            <!-- Will want to only include certain fields in the <pre/> tags in the future -->
                            <pre>{{ format(value, key) }}</pre> 
                        </td>
                    </template>
                </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>

<style scoped>

button {
    background-color: var(--color-background-soft);
    border: 1px solid var(--color-border);
    color: var(--color-text);
    cursor: pointer;
    border-radius: 4px;
    padding: 2px 5px;
    font-family: inherit;
    
}

#rowCount, #exportButton {
    align-self: flex-end;
    line-height: 1.6;
    margin: 3px;
}

#clearFiltersButton {
    line-height: 1.6;
    margin: 3px;
}

.title {
    flex-grow: 1
}

.filterHeader {
    flex-grow: 1;
}

.tableWithSelects, .inputLine, .headerBox, .titleBar {
    display: flex;
    flex-direction: row;
}

.tableContainer, .columnSelect{
    display: flex;
    flex-direction: column;
    width: max-content;
}

.tableContainer {
    height: 100%;
}

.columnSelect {
    min-width: 27ch;
    margin-right: 20px;
}

.displayTable, .displayTable :deep(td), .displayTable :deep(th) {
    border: 1px solid var(--color-border);
    border-collapse: collapse;
}

.displayTable :deep(td), .displayTable :deep(th) {
    text-align: left;
    vertical-align: middle;
    width: fit-content;
    padding: 3px 5px;
}

.displayTable :deep(th) {
    white-space: nowrap;
    background-color: var(--color-background-soft);
    font-weight: bold;
}

/* .displayTable :deep(td) {
    
} */

.inputLine :deep(label) {
    color: var(--color-text);
    white-space: nowrap;
    padding: 0 5px;
    cursor:pointer
}

.sortButton, .headerBox, input {
    cursor: pointer;
}

.sortButton {
    align-self: center;
    background-color: var(--color-background-soft);
    border: none;
    color: var(--color-text);
}

pre {
    font-family: inherit;
    text-wrap: balance; /* Will move text-wrap property to .displayTable :deep(td) in the future */
}
</style>