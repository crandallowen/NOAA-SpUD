<script setup>
import { ref, reactive, computed, watchEffect } from 'vue';
import { headerMap, allColumns } from '@/js/utils';
import { searchResultsTable } from '@/js/state';

const options = ref('');

watchEffect(async () => {
    let url = new URL('http://localhost:7007/getOptions');
    const response = await fetch(url);
    await response.json()
        .then((response) => {
            // console.log(response);
            options.value = response;
        })
});

const input = reactive({});
const serialNumRelation = ref('');
const serialNumInputLower = ref('');
const serialNumInput = ref('');
const frequencyRelation = ref('');
const frequencyInputLower = ref('');
const frequencyInput = ref('');
const bureauSelection = ref('');
const bureaus = ref([]);
const txStateCountryCodeSelection = ref('');
const txStateCountryCodes = ref([]);
const rxStateCountryCodeSelection = ref('');
const rxStateCountryCodes = ref([]);
const txAntennaLocationSelection = ref('');
const txAntennaLocations = ref([]);
const rxAntennaLocationSelection = ref('');
const rxAntennaLocations = ref([]);
const stationClassSelection = ref([]);
const stationClasses = ref([]);
const functinoIdentifierSelection = ref([]);
const functinoIdentifiers = ref([]);
const numericRelations = ref(['==', '>=', '>', '<=', '<', '!=', 'between']);
const query = ref([]);

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
                <h3 class="inputLabel">Serial Number</h3>
                <select v-model="serialNumRelation">
                    <option disabled value=""></option>
                    <option v-for="relation in numericRelations" :value="relation">
                        {{ relation }}
                    </option>
                </select>
                <div v-show="serialNumRelation === 'between'" class="inputLine">
                    <input v-model="serialNumInputLower" />
                    <p class="inputSeperator">and</p>
                </div>
                <input v-model="serialNumInput" />
            </div>
            <div class="divider" />
            <div class="inputLine">
                <h3 class="inputLabel">Frequency</h3>
                <select v-model="frequencyRelation">
                    <option disabled value=""></option>
                    <option v-for="relation in numericRelations" :value="relation">
                        {{ relation }}
                    </option>
                </select>
                <div v-show="frequencyRelation === 'between'" class="inputLine">
                    <input v-model="frequencyInputLower" />
                    <p class="inputSeperator">and</p>
                </div>
                <input v-model="frequencyInput" />
            </div>
            <div class="divider" />
            <div class="inputLine">
                <h3 class="inputLabel">Bureau</h3>
                <select v-model="bureauSelection">
                    <option disabled value="">Please select one</option>
                    <option v-for="bureau in options.bureaus" :value="bureau">
                        {{ bureau }}
                    </option>
                </select>
            </div>
            <div class="divider" />
            <h3>Result Columns</h3>
            <div class="columns">
                <template v-for="column in allColumns">
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

.inputLabel {
    padding-right: 5px;
}

.inputSeperator {
    padding: 0 5px;
}

input, select, button {
    border-radius: 4px;
}

input, select, button {
    background-color: var(--color-background-soft);
    border: 1px solid var(--color-border);
    color: var(--color-text);
}

label, input, select, button {
    padding: 2px 5px;
}
</style>