<script setup>
import { ref, reactive, watch, watchEffect } from 'vue';
import { format, headerMap, visibleColumnGroups, frequencyHzTokHz } from '@/js/utils';
import collapsibleGroup from '@/components/collapsibleGroup.vue';
import { getFilters, query } from '@/js/api';

const props = defineProps({
    title: String,
    useStore: Function,
});

const columns = ref(null);
const rows = ref(null);
const store = props.useStore();
const today = new Date();
const rowFilters = reactive({
    'bureau': [],
    'function_identifier': [],
    'tx_state_country_code': [], 
    'isAssignment': [
        // Utilizes standard condition of query route built for serial_num search
        {id: 'isAssignment', name: 'Assignments', condition: {field: 'serial_num', relation: '!~', value: 'p$'}},
        {id: 'isProposal', name: 'Proposals', condition: {field: 'serial_num', relation: '~', value: 'p$'}}
    ],
    'due_for_review': [
        // Utilizes a special condition in query route
        {id: 'overdue', name: 'Overdue', condition: {field: 'review_date', relation: 'between', lowerValue: `19000101`, value: `${today.getFullYear()}${String(today.getMonth()+1).padStart(2, '0')}${String(today.getDate()-1).padStart(2, '0')}`}},
        {id: 'thisYear', name: 'Due this year', condition: {field: 'review_date', relation: 'between', lowerValue: `${today.getFullYear()}0101`, value: `${today.getFullYear()}1231`}},
        {id: 'nextYear', name: 'Due next year', condition: {field: 'review_date', relation: 'between', lowerValue: `${today.getFullYear()+1}0101`, value: `${today.getFullYear()+1}1231`}}
    ]
});

watch(store, (store) => {localStorage.setItem(store.$id, JSON.stringify(store))}, {deep: true});
getFilters(rowFilters);
watchEffect(() => {query(rows, columns, store);});

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
            <!-- Row Filters -->
            <span class="titleBar">
                <h2 class="filterHeader">Filters</h2>
                <button id="clearFiltersButton" @click="store.clearFilters()">Clear All</button>
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
            <!-- Column Selects -->
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
                        <th @click="store.handleSort(value)">
                            <div class="headerBox">
                                {{ headerMap(value) }}
                                <button @click.stop="store.handleSort(value)" class="sortButton">
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