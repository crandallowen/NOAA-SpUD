<script setup>
import { ref, reactive, computed } from 'vue';
import { formatFrequency, frequencyToKHz, headerMap, defaultColumns } from '@/js/utils';
import { searchResultsTable } from '@/js/state';

const props = defineProps({
    bureaus: Array,
    columns: Array
});

const input = reactive({});
const serialNumRelation = ref('');
const serialNumInputLower = ref('');
const serialNumInput = ref('');
const frequencyRelation = ref('');
const frequencyInputLower = ref('');
const frequencyInput = ref('');
const bureauSelection = ref('');
const query = ref([]);
const numericRelations = ref(['==', '>=', '>', '<=', '<', '!=', 'between']);

function search(query, conditionExpected) {
    console.log('Search');
    $emit('search');
}

</script>

<template>
    <h1>Search</h1>
    <div id="searchInputs">
        <div id="conditionInputs">
            <div class="inputLine">
                <h3>Serial Number</h3>
                <select v-model="serialNumRelation">
                    <option disabled value=""></option>
                    <option v-for="relation in numericRelations" :value="relation">
                        {{ relation }}
                    </option>
                </select>
                <div v-show="serialNumRelation === 'between'" class="inputLine">
                    <input v-model="serialNumInputLower" />
                    <p>and</p>
                </div>
                <input v-model="serialNumInput" />
            </div>
            <div class="divider" />
            <div class="inputLine">
                <h3>Frequency</h3>
                <select v-model="frequencyRelation">
                    <option disabled value=""></option>
                    <option v-for="relation in numericRelations" :value="relation">
                        {{ relation }}
                    </option>
                </select>
                <div v-show="frequencyRelation === 'between'" class="inputLine">
                    <input v-model="frequencyInputLower" />
                    <p>and</p>
                </div>
                <input v-model="frequencyInput" />
            </div>
            <div class="divider" />
            <div class="inputLine">
                <h3>Bureau</h3>
                <select v-model="bureauSelection">
                    <option disabled value="">Please select one</option>
                    <option v-for="bureau in props.bureaus" :value="bureau">
                        {{ bureau }}
                    </option>
                </select>
            </div>
            <div class="divider" />
            <h3>Result Columns</h3>
            <div class="columns">
                <template v-for="column in props.columns">
                    <div class="inputLine">
                        <input type="checkbox" :id="column" :value="column" v-model="searchResultsTable.displayColumns">
                        <label :for="column">{{ headerMap(column) }}</label>
                    </div>
                </template>
            </div>
        </div>
        <div class="divider" />
        <div class="divider" />
        <div id="queryDisplay">
            <div class="inputLine">
                <button @click="($event) => $emit('search', query)">Search</button>
            </div>
        </div>
    </div>
</template>

<style scoped>
.inputLine, #searchInputs {
    display: flex;
    flex-direction: row;
}

.columns, #conditionInputs, #setOperators {
    display: flex;
    flex-direction: column;
}

.divider {
    width: var(--small-section-gap);
    height: 20px;
}

#queryString {
    min-width: 5em;
    min-height: 1.25em;
    background-color: var(--color-background-mute);
}

input, select, button, #queryString {
    border-radius: 4px;
}

input, select, button {
    background-color: var(--color-background-soft);
    border: 1px solid var(--color-border);
    color: var(--color-text);
}

label, input, select, button, #queryString {
    padding: 2px 5px;
}
</style>