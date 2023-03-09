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

const url = computed(() => {
    let url = new URL('http://localhost:7007/query');
    let orderedColumns = [];
    allColumns.forEach((column) => {if (props.state.displayColumns.includes(column)) {orderedColumns.push(column)}})
    orderedColumns.forEach((column) => url.searchParams.append('column', column));
    url.searchParams.append('sortColumn', props.state.sort.column);
    url.searchParams.append('sortDirection', props.state.sort.direction);
    return url;
});

watchEffect(async () => {
    const response = await fetch(url.value);
    await response.json()
        .then((response) => {
            columns.value = response.columns;
            rows.value = response.rows;
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

function handleSort(event) {
    let column = event.srcElement.id;
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
                        <th>
                            {{ headerMap(value) }}
                            <button @click="handleSort" :id="value" class="sortButton">
                                {{ props.state.sort.column != value ? '^/v' : (props.state.sort.direction === 'ascending' ? '^' : 'v') }}
                            </button>
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
.tableWithSelects, .inputLine {
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
    min-width: 26ch;
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

.sortButton {
    float: right;
    background-color: var(--color-background-soft);
    border: 1px solid var(--color-border);
    color: var(--color-text);
    border-radius: 4px;
}

pre {
    font-family: inherit;
}
</style>