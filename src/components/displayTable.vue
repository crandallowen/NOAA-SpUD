<script setup>
import { ref, reactive, computed, watchEffect } from 'vue';
import { format, headerMap, emissionGroup, txGroup, rxGroup, allColumns } from '@/js/utils';
import collapsibleGroup from './collapsibleGroup.vue';

const props = defineProps({
    title: String,
    state: Object,
    params: Object
});

const columns = ref(null);
const rows = ref(null);
const sortDirection = ref(null);
const sortColumn = ref(null);

watchEffect(async () => {
    let url = new URL('http://localhost:7007/query');
    let orderedColumns = [];
    allColumns.forEach((column) => {if (props.state.displayColumns.includes(column)) {orderedColumns.push(column)}})
    orderedColumns.forEach((column) => url.searchParams.append('column', column));
    url.searchParams.append('sortColumn', props.state.sort.column);
    url.searchParams.append('sortDirection', props.state.sort.direction);
    if (props.params) {
        let paramsList = [];
        for (const i in props.params) {
            paramsList.push(JSON.stringify(props.params[i]));
        }
        url.searchParams.append('params', `[${paramsList.join(',')}]`)
    }
    const response = await fetch(url);
    await response.json()
        .then((response) => {
            columns.value = response.columns;
            rows.value = response.rows;
            sortDirection.value = props.state.sort.direction;
            sortColumn.value = props.state.sort.column;
        })
});

const recordColumns = computed(() => {
    let recordColumns = [];
    allColumns.forEach((column) => {
        if (!(emissionGroup.includes(column) || txGroup.includes(column) || rxGroup.includes(column)))
            {
                recordColumns.push(column);
            }
    });
    return recordColumns;
});

const visibleColumnGroups = reactive({
    'Record Columns': recordColumns,
    'Emission Group Columns': emissionGroup,
    'Transmitter Columns': txGroup,
    'Receiver Columns': rxGroup
});

function handleSort(column) {
    if (column === props.state.sort.column) {
        if (props.state.sort.direction === 'ascending')
            props.state.sort.direction = 'descending';
        else
            props.state.sort.direction = 'ascending';
    } else {
        props.state.sort.column = column;
        props.state.sort.direction = 'ascending';
    }
    console.log('Sort rows by', props.state.sort.column, 'in', props.state.sort.direction, 'order');
}
</script>

<template>
    <div class="tableWithSelects">
        <!-- Side Bar -->
        <div class="columnSelect">
            <h2>Column Select</h2>
            <template v-for="key in Object.keys(visibleColumnGroups)">
                <collapsibleGroup :group-name="key">
                    <template v-for="column in visibleColumnGroups[key]">
                        <div class="inputLine">
                            <input type="checkbox" :id="column" :value="column" v-model="props.state.displayColumns">
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