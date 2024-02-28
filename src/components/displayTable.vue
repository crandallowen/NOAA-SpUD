<script setup>
import { ref, reactive, computed, watchEffect } from 'vue';
import { format, headerMap, visibleColumnGroups, allColumns, defaultColumns, frequencyFilters } from '@/js/utils';
import collapsibleGroup from '@/components/collapsibleGroup.vue';

const props = defineProps({
    title: String,
    sortColumn: {
        type: String,
        default: 'center_frequency'
    },
    sortDirection: {
        type: String,
        default: 'ascending'
    },
    displayColumns: {
        type: String,
        default(rawProps) {
            return [...defaultColumns];
        }
    },
    params: {
        type: Array,
        default(rawProps) {
            return [];
        }
    }
});

const columns = ref(null);
const rows = ref(null);
const sortDirection = ref(null);
const sortColumn = ref(null);
const state = reactive({
    sort: {
        column: props.sortColumn,
        direction: props.sortDirection
    },
    displayColumns: [...props.displayColumns],
    params: [...props.params]
});
const rowFilters = reactive({
    'center_frequency': frequencyFilters,
    'bureau': [],
    'function_identifier': [],
    'tx_state_country_code': []
});

watchEffect(async () => {
    let url = new URL('http://localhost:7007/getFilters');
    const response = await fetch(url);
    await response.json()
        .then((response) => {
            for (const field in rowFilters) {
                for (const i in response[field]) {
                    rowFilters[field].push({id: field+'Filter'+i, name: response[field][i], condition: {field: field, value: response[field][i]}});
                }
            }
        })
    // console.log(rowFilters);
});

watchEffect(async () => {
    let url = new URL('http://localhost:7007/query');
    let orderedColumns = [];
    allColumns.forEach((column) => {if (state.displayColumns.includes(column)) {orderedColumns.push(column)}})
    orderedColumns.forEach((column) => url.searchParams.append('column', column));
    url.searchParams.append('sortColumn', state.sort.column);
    url.searchParams.append('sortDirection', state.sort.direction);
    if (state.params.length != 0) {
        let paramsList = [];
        for (const i in state.params) {
            paramsList.push(JSON.stringify(state.params[i]));
        }
        url.searchParams.append('params', `[${paramsList.join(',')}]`)
    }
    const response = await fetch(url);
    await response.json()
        .then((response) => {
            columns.value = response.columns;
            rows.value = response.rows;
            sortDirection.value = state.sort.direction;
            sortColumn.value = state.sort.column;
        })
});

function handleSort(column) {
    if (column === state.sort.column) {
        if (state.sort.direction === 'ascending')
            state.sort.direction = 'descending';
        else
            state.sort.direction = 'ascending';
    } else {
        state.sort.column = column;
        state.sort.direction = 'ascending';
    }
    console.log('Sort rows by', state.sort.column, 'in', state.sort.direction, 'order');
}
</script>

<template>
    <div class="tableWithSelects">
        <!-- Side Bar -->
        <div class="columnSelect">
            <h2>Filters</h2>
            <template v-for="key in Object.keys(rowFilters)">
                <collapsibleGroup :group-name="headerMap(key)" collapsed>
                    <template v-for="filter in rowFilters[key]">
                        <div class="inputLine">
                            <input type="checkbox" :id="filter.id" :value="filter.condition" v-model="state.params">
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
                            <input type="checkbox" :id="column" :value="column" v-model="state.displayColumns">
                            <label :for="column">{{ headerMap(column) }}</label>
                        </div>
                    </template>
                </collapsibleGroup>
            </template>
        </div>
        <!-- Table -->
        <div class="tableContainer">
            <h2>{{ props.title }}</h2>
            <table class="displayTable">
                <thead>
                <tr>
                    <template v-for="value in columns">
                        <th @click="handleSort(value)">
                            <div class="headerBox">
                                {{ headerMap(value) }}
                                <button @click.stop="handleSort(value)" class="sortButton">
                                    {{ sortColumn != value ? '\u25B2/\u25BC' : (sortDirection === 'ascending' ? '\u25B2' : '\u25BC') }}
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
.tableWithSelects, .inputLine, .headerBox {
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
}

.sortButton, .headerBox {
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
}
</style>