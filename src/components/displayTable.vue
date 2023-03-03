<script setup>
import { ref, reactive, computed, watch } from 'vue';
import { format, headerMap, defaultColumns } from '@/js/utils';

const props = defineProps({
    title: String, 
    columns: Array,
    rows: Array,
    filters: Array
});

const activeColumns = ref([...defaultColumns]);
const sortField = ref('frequency_khz');
const sortDirection = ref('ascending');

const sortedRows = computed(() => {
    let rows = [...props.rows];
    if (sortField.value === 'frequency_khz') {
        if (sortDirection.value === 'ascending')
            return rows.sort((a,b) => a[sortField.value] - b[sortField.value]);
        else
            return rows.sort((a,b) => b[sortField.value] - a[sortField.value]);
    } else {
        if (sortDirection.value === 'ascending')
            return rows.sort((a,b) => (a[sortField.value] > b[sortField.value]) ? 1 : ((b[sortField.value] > a[sortField.value]) ? -1 : 0));
        else
            return rows.sort((a,b) => (a[sortField.value] < b[sortField.value]) ? 1 : ((b[sortField.value] < a[sortField.value]) ? -1 : 0));
    }
});

function sortByColumn(event) {
    let column = event.srcElement.id;
    if (column === sortField.value) {
        if (sortDirection.value === 'ascending')
            sortDirection.value = 'descending';
        else
            sortDirection.value = 'ascending';
    } else {
        sortField.value = column;
        sortDirection.value = 'ascending';
    }
    console.log('Sort rows by', sortField.value, 'in', sortDirection.value, 'order');
}
</script>

<template>
    <div class="tableWithSelects">
        <div class="columnSelect">
            <h3>Column Select</h3>
            <template v-for="column in props.columns">
                <div class="inputLine">
                    <input type="checkbox" :id="column" :value="column" v-model="activeColumns">
                    <label :for="column">{{ headerMap(column) }}</label>
                </div>
            </template>
        </div>
        <div class="tableContainer">
            <h2>{{ props.title }}</h2>
            <table class="displayTable">
                <thead>
                <tr>
                    <template v-for="value in props.columns">
                        <th v-show="activeColumns.includes(value)">
                            {{ headerMap(value) }}
                            <button @click="sortByColumn" :id="value" class="sortButton">
                                {{ sortField != value ? '^/v' : (sortDirection === 'ascending' ? '^' : 'v') }}
                            </button>
                        </th>
                    </template>
                </tr>
                </thead>
                <tbody>
                <tr v-for="row in sortedRows">
                    <template v-for="(value, key) in row">
                        <td v-show="activeColumns.includes(key)">
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