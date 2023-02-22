<script setup>
import displayTable from './displayTable.vue';
import { ref, reactive, computed } from 'vue';
import { request, headerMap, allColumns, defaultColumns } from '@/js/utils';

const props = defineProps({
    rows: Array
});

const activeColumns = reactive({});
for (const column of allColumns) {
    if (defaultColumns.includes(column))
        activeColumns[column] = true;
    else
        activeColumns[column] = false;
}

const columns = computed(() => {
    let columns = [];
    for (const column in activeColumns)
        if (activeColumns[column])
            columns.push(column);
    return columns;
});

const activeColumnRows = computed(() => {
    let tempRows = [];
    props.rows.forEach((row) => {
        let tempRow = {};
        for (const column in activeColumns)
            if (activeColumns[column])
                tempRow[column] = row[column]
        tempRows.push(tempRow);
    });
    return tempRows;
});

function toggleColumn(column) {
    if (activeColumns[column])
        activeColumns[column] = false;
    else
        activeColumns[column] = true;
}

// const rows = ref([]);
// const getRFAsURL = 'getRFAs?columns=' + columns.value.join(',');

// request({method: 'GET', url: 'getRFAs'})
//     .then((responseJSON) => {
//         let response = JSON.parse(responseJSON);
//         response.rows.forEach(row => {
//             rows.value.push(reactive(row));
//         });
//         // response.fields.forEach(field => {
//         //     headers.value.push(headerMap(field.name));
//         // });
//     })
//     .catch((error) => {
//         console.error(error);
//     })
//     .finally(() => {
//         // console.log(rows);
//         // console.log(headers);
//     });

// const table = computed(() => {
//     request({method: 'GET', url: 'getRFAs'})
//     .then((responseJSON) => {
//         let rows = [];
//         let headers = [];
//         let response = JSON.parse(responseJSON);
//         response.rows.forEach(row => {
//             rows.push(row);
//         });
//         response.fields.forEach(field => {
//             headers.push(headerMap(field.name));
//         });
//         console.log(headers);
//         return [headers, rows];
//     })
//     .catch((error) => {
//         console.error(error);
//     })
//     .finally(() => {
//         // console.log(rows);
//         // console.log(headers);
//     });
// })
</script>

<template>
    <div class="tableWithSelects">
        <div class="columnSelect">
            <h3>Column Select</h3>
            <button v-for="column in allColumns" @click="toggleColumn(column)">
                {{ headerMap(column) }}
            </button>
        </div>
        <displayTable title="RFA Table" :columns="columns.map((header) => headerMap(header))" :rows="activeColumnRows"/>
        <!-- <displayTable :headers="table.value[0]" :rows="table.value[1]"/> -->
    </div>
</template>

<style scoped>
.tableWithSelects {
    display: flex;
    flex-direction: row;
}
.columnSelect {
    display: flex;
    flex-direction: column;
    padding-right: 8px;
}

button {
    background-color: var(--color-background-soft);
    border: 1px solid var(--color-border);
    color: var(--color-text);
    border-radius: 4px;
}
</style>