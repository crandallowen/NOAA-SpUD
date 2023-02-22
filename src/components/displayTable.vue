<script setup>
import { formatFrequency } from '@/js/utils';

// defineProps(['title', 'headers', 'rows'])
const props = defineProps({
    title: String, 
    columns: Array,
    rows: Array
});

function format(value, key) {
    if (Array.isArray(value))
        return value.join('\n');
    else if (key === 'frequency_khz')
        return formatFrequency(value);
    else if (key.slice(-4) == 'date' && value != null)
        return value.substring(5, 7) + '/' + value.substring(8, 10) + '/' + value.substring(0, 4);
    else return value;
}
</script>

<template>
    <div class="tableContainer">
        <h2>{{ props.title }}</h2>
        <table class="displayTable">
            <thead>
            <tr>
                <th v-for="value in props.columns">
                    {{ value }}
                </th>
            </tr>
            </thead>
            <tbody>
            <tr v-for="row in props.rows">
                <td v-for="(value, key, index) in row">
                    {{ format(value, key) }}
                </td>
            </tr>
            </tbody>
        </table>
    </div>
</template>

<style scoped>
.tableContainer {
    display: flex;
    flex-direction: column;
}
/* .displayTable {
} */
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
}

.displayTable tbody :deep(*) {
    text-align: left;
    vertical-align: middle;

}
</style>