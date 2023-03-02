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
                    </th>
                    </template>
                </tr>
                </thead>
                <tbody>
                <tr v-for="row in props.rows">
                    <template v-for="(value, key) in row">
                    <td v-show="activeColumns.includes(key)">
                        {{ format(value, key) }}
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
.columnSelect {
    display: flex;
    flex-direction: column;
    padding-right: 4px;
    min-width: 20px;
}
.tableContainer {
    display: flex;
    flex-direction: column;
}
.displayTable, .displayTable :deep(*) {
    border: 1px solid var(--color-border);
    border-collapse: collapse;
    
}
.displayTable :deep(*) {
    width: fit-content;
    padding: 2px 5px;
}
.displayTable thead :deep(*) {
    text-align: left;
    vertical-align: middle;
    white-space: nowrap;
    background-color: var(--color-background-soft);
    font-weight: bold;
}

.displayTable tbody :deep(*) {
    text-align: left;
    vertical-align: middle;

}

button {
    border: 1px solid var(--color-border);
    color: var(--color-text);
    border-radius: 4px;
}

.activeColumn {
    background-color: var(--color-toggle-active);
}

.inactiveColumn {
    background-color: var(--color-background-soft);
}
</style>