<script setup>
import { ref, reactive, watch, watchEffect } from 'vue';
import { format, headerMap, visibleColumnGroups, frequencyHzTokHz, groupedColumns } from '@/js/utils';
import collapsibleGroup from '@/components/collapsibleGroup.vue';
import { getFilters, query } from '@/js/api';

const props = defineProps({
    title: String,
    useStore: Function,
});
const isReady = ref(false);
const columns = ref(null);
const rows = ref(null);
const store = props.useStore();
const sort = ref(store.sort);
const today = new Date();
const rowFilters = reactive({
    'bureau': [],
    'function_identifier': [],
    'tx_state_country_code': [], 
    'isAssignment': [
        // Utilizes standard condition of query route built for serial_number search
        {id: 'isAssignment', name: 'Assignments', condition: {field: 'serial_number', relation: '!~', value: 'p$'}},
        {id: 'isProposal', name: 'Proposals', condition: {field: 'serial_number', relation: '~', value: 'p$'}}
    ],
    'due_for_review': [
        // Utilizes a special condition in query route
        {id: 'overdue', name: 'Overdue', condition: {field: 'review_date', relation: 'between', lowerValue: `19000101`, value: `${today.getFullYear()}${String(today.getMonth()+1).padStart(2, '0')}${String(today.getDate()-1).padStart(2, '0')}`}},
        {id: 'thisYear', name: 'Due this year', condition: {field: 'review_date', relation: 'between', lowerValue: `${today.getFullYear()}0101`, value: `${today.getFullYear()}1231`}},
        {id: 'nextYear', name: 'Due next year', condition: {field: 'review_date', relation: 'between', lowerValue: `${today.getFullYear()+1}0101`, value: `${today.getFullYear()+1}1231`}}
    ]
});

watch(store, (store) => {localStorage.setItem(store.$id, JSON.stringify({sort: {...store.sort}, displayColumns: [...store.displayColumns], filters: [...store.filters]}))}, {deep: true});
getFilters()
    .then((filters) => {
        if(filters)
            for (const field in filters)
                for (const i in filters[field])
                    rowFilters[field].push({id: field+'Filter'+i, name: filters[field][i], condition: {field: field, value: filters[field][i]}});
    });
watchEffect(() => {
    isReady.value = false;
    document.body.style.cursor = 'wait';
    query(store)
        .then((data) => {
            if (data) {
                columns.value = data.columns;
                rows.value = data.rows;
                sort.value = store.sort;
                isReady.value = true;
            }
        })
        .finally(() => {document.body.style.cursor = 'default';});
}, {flush: 'post'});

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
    <div id="tableWithSelects" class="flexRow">
        <!-- Side Bar -->
        <div id="sideBar" class="flexColumn">
            <!-- Row Filters -->
             <div id="filtersBox">
                <span id="filterHeaderBar" class="flexRow">
                    <h2 id="filterHeader">Filters</h2>
                    <button id="clearFiltersButton" @click="store.clearFilters()">Clear All</button>
                </span>
                <template v-for="key in Object.keys(rowFilters)">
                    <collapsibleGroup :group-name="headerMap(key)" collapsed>
                        <template v-for="filter in rowFilters[key]">
                            <div class="inputLine flexRow">
                                <input type="checkbox" :id="filter.id" :value="filter.condition" v-model="store.filters">
                                <label :for="filter.id">{{ filter.name }}</label>
                            </div>
                        </template>
                    </collapsibleGroup>
                </template>
            </div>
            <!-- Column Selects -->
             <div id="columnSelectsBox">
                <h2 id="columnSelectsHeader">Column Select</h2>
                <template v-for="key in Object.keys(visibleColumnGroups)">
                    <collapsibleGroup :group-name="key" collapsed>
                        <template v-for="column in visibleColumnGroups[key]">
                            <div class="inputLine flexRow">
                                <input type="checkbox" :id="column" :value="column" v-model="store.displayColumns">
                                <label :for="column">{{ headerMap(column) }}</label>
                            </div>
                        </template>
                    </collapsibleGroup>
                </template>
            </div>
        </div>
        <!-- Table -->
        <div id="tableContainer" class="flexColumn">
            <div id="tableTitleBar" class="flexRow">
                <h2 id="title">{{ props.title }}</h2>
                <button type="button" id="exportButton" @click="downloadCSVData">Export to .csv</button>
                <p id="rowCount">{{ rows !== null ? `${Object.keys(rows).length} result${Object.keys(rows).length == 1 ? '' : 's'}` : ''}}</p>
            </div>
            <table id="displayTable">
                <thead>
                <tr>
                    <template v-for="value in columns">
                        <th @click.stop="store.handleSort(value)">
                            <div class="headerBox flexRow">
                                <p class="headerText">{{ headerMap(value) }}</p>
                                <button @click.stop="store.handleSort(value)" class="sortButton">
                                    {{ sort.column != value ? '\u25B2/\u25BC' : (sort.direction === 'ascending' ? '\u25B2' : '\u25BC') }}
                                </button>
                            </div>
                        </th>
                    </template>
                </tr>
                </thead>
                <template v-if="isReady">
                    <tbody>
                    <tr v-for="row in rows">
                        <template v-for="(value, key) in row">
                            <td>
                                <pre v-if="groupedColumns.includes(key)">{{ format(value, key) }}</pre>
                                <template v-else>{{ format(value, key) }}</template> 
                            </td>
                        </template>
                    </tr>
                    </tbody>
                </template>
                <template v-else-if="columns !== null">
                    <tbody>
                        <tr>
                            <td :colspan="columns.length">
                                <h2 class="loadingRow">{{ 'loading...' }}</h2>
                            </td>
                        </tr>
                    </tbody>
                </template>
                <h2 class="loadingRow" v-else>{{ 'loading...' }}</h2>
            </table>
        </div>
    </div>
</template>
<style scoped>
#filterHeader, #columnSelectsHeader {
    color: var(--color-heading);
}

#filtersBox, #columnSelectsBox {
    background-color: var(--color-background-mute);
    padding: 8px;
    border-radius: 4px;
}

#filtersBox {
    margin-bottom: 20px;
}

#rowCount {
    padding: 3px 0;
    font-size: 18px;
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

.loadingRow {
    text-align: center;
    color: var(--color-text);
}

#title {
    color: var(--color-heading);
}

#title, #filterHeader, .headerText {
    flex-grow: 1;
}

#tableContainer, #sideBar{
    width: max-content;
}

#tableContainer {
    height: 100%;
}

#sideBar {
    margin-right: 20px;
}

#displayTable, #displayTable :deep(td), #displayTable :deep(th) {
    border: 1px solid var(--color-border);
    border-collapse: collapse;
}

#displayTable :deep(td), #displayTable :deep(th) {
    text-align: left;
    vertical-align: middle;
    padding: 3px 5px;
}

#displayTable :deep(th) {
    white-space: nowrap;
    background-color: var(--color-main);
    font-weight: bold;
    width: fit-content;
}

#displayTable :deep(td) {
    text-wrap: balance;
    background-color: var(--color-table-background);
    max-width: 25vw;
}

.inputLine :deep(label) {
    color: var(--color-text);
    white-space: nowrap;
    padding: 0 5px;
    cursor: pointer;
}

.headerBox {
    cursor: pointer
}

.sortButton {
    align-self: center;
    background-color: inherit;
    border: none;
    font-size: revert;
    padding: revert;
}

pre {
    font-family: inherit;
    text-wrap: nowrap;
}
</style>