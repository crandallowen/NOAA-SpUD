<script setup>
import { ref, reactive, computed, watchEffect } from 'vue';
import { frequencyToKHz, headerMap, allColumns, format } from '@/js/utils';
import { searchResultsTable } from '@/js/state';

const emit = defineEmits(['search']);

const options = ref({});

watchEffect(async () => {
    let url = new URL('http://localhost:7007/getOptions');
    const response = await fetch(url);
    await response.json()
        .then((response) => {
            // console.log(response);
            options.value = response;
        })
});

const serialNumRelation = ref('');
const serialNumInputLower = ref('');
const serialNumInput = ref('');
const frequencyRelation = ref('');
const frequencyInputLower = ref('');
const frequencyInput = ref('');
const bureauSelection = ref('');
const txStateCountryCodeSelection = ref('');
const rxStateCountryCodeSelection = ref('');
const txAntennaLocationSelection = ref('');
const rxAntennaLocationSelection = ref('');
const stationClassSelection = ref('');
const functionIdentifierSelection = ref('');
const numericRelations = ['==', '>=', '>', '<=', '<', '!=', 'between'];

const query = ref([]);

const queryString = computed(() => {
    let queryString = '';
    if (query.value.length != 0) {
        let queryObject = {}
        for (const i in query.value) {
            if (!Object.keys(queryObject).includes(query.value[i].field)) {
                queryObject[query.value[i].field] = [];
            }
            if (query.value[i].field === 'serial_num' || query.value[i].field === 'frequency_khz') {
                if (query.value[i].relation != 'between')
                    queryObject[query.value[i].field].push(`${query.value[i].relation} ${format(query.value[i].value, query.value[i].field)}`);
                else
                    queryObject[query.value[i].field].push(`${query.value[i].relation} ${format(query.value[i].lowerValue, query.value[i].field)} and ${format(query.value[i].higherValue, query.value[i].field)}`);
            } else if (['bureau', 'tx_state_country_code', 'rx_state_country_code', 'tx_antenna_location', 'rx_antenna_location', 'station_class', 'function_identifier'].includes(query.value[i].field)) {
                queryObject[query.value[i].field].push(query.value[i].value)            
            }
        }
        let queryList = []
        for (const field in queryObject) {
            if (field === 'serial_num' || field === 'frequency_khz')
                queryList.push(`${headerMap(field)} ${queryObject[field].join(' OR ')}`);
            else
                queryList.push(`${headerMap(field)} in [${queryObject[field].join(', ')}]`)
        }
        queryString = queryList.join('\n');
    }
    return queryString;
});

function add(field) {
    if (field === 'serial_num') {
        if (serialNumRelation.value != 'between') {
            query.value.push({field: field, relation: serialNumRelation.value, value: serialNumInput.value});
            serialNumInput.value = '';
            serialNumRelation.value = '';
        } else {
            query.value.push({field: field, relation: serialNumRelation.value, lowerValue: serialNumInputLower.value, higherValue: serialNumInput.value});
            serialNumInput.value = '';
            serialNumInputLower.value = '';
            serialNumRelation.value = '';
        }
    } else if (field === 'frequency_khz') {
        let frequency_khz = frequencyToKHz(frequencyInput.value);
        if (frequencyRelation.value != 'between') {
            if (frequency_khz) {
                query.value.push({field: field, relation: frequencyRelation.value, value: frequency_khz});
                frequencyInput.value = '';
                frequencyRelation.value = '';
            } else {
                console.log('Invalid frequency:', frequencyInput.value);
            }
        } else {
            let frequencyLower_khz = frequencyToKHz(frequencyInputLower.value);
            if (frequency_khz && frequencyLower_khz) {
                query.value.push({field: field, relation: frequencyRelation.value, lowerValue: frequencyLower_khz, higherValue: frequency_khz});
                frequencyInput.value = '';
                frequencyInputLower.value = '';
                frequencyRelation.value = '';
            } else {
                if (!frequency_khz) {
                    console.log('Invalid frequency:', frequencyInput.value);
                } else {
                    console.log('Invalid frequency:', frequencyInputLower.value);
                }
            }
        }
    } else if (field == 'bureau') {
        query.value.push({field: field, value: bureauSelection.value});
        bureauSelection.value = '';
    } else if (field === 'tx_state_country_code') {
        query.value.push({field: field, value: txStateCountryCodeSelection.value});
        txStateCountryCodeSelection.value = '';
    } else if (field === 'rx_state_country_code') {
        query.value.push({field: field, value: rxStateCountryCodeSelection.value});
        rxStateCountryCodeSelection.value = '';
    } else if (field === 'tx_antenna_location') {
        query.value.push({field: field, value: txAntennaLocationSelection.value});
        txAntennaLocationSelection.value = '';
    } else if (field === 'rx_antenna_location') {
        query.value.push({field: field, value: rxAntennaLocationSelection.value});
        rxAntennaLocationSelection.value = '';
    } else if (field === 'station_class') {
        query.value.push({field: field, value: stationClassSelection.value});
        stationClassSelection.value = '';
    } else if (field === 'function_identifier') {
        query.value.push({field: field, value: functionIdentifierSelection.value});
        functionIdentifierSelection.value = '';
    }
    // console.log(query.value);
}

function search(query) {
    emit('search', query);
}

function clear() {
    query.value = [];
}

</script>

<template>
    <h1>Search</h1>
    <div id="searchInputs">
        <div id="conditionInputs">
            <div class="inputLine">
                <!-- Search Inputs -->
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
                <button @click="add('serial_num')" :disabled="serialNumRelation === '' || serialNumInput === '' || (serialNumRelation === 'between' && serialNumInputLower === '')">Add</button>
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
                <button @click="add('frequency_khz')" :disabled="frequencyRelation === '' || frequencyInput === '' || (frequencyRelation === 'between' && frequencyInputLower === '')">Add</button>
            </div>
            <div class="divider" />
            <div class="inputLine">
                <h3 class="inputLabel">Bureau</h3>
                <select v-model="bureauSelection">
                    <option disabled value=""></option>
                    <option v-for="bureau in options.bureaus" :value="bureau">
                        {{ bureau }}
                    </option>
                </select>
                <button @click="add('bureau')" :disabled="bureauSelection === ''">Add</button>
            </div>
            <div class="divider" />
            <div class="inputLine">
                <h3 class="inputLabel">Transmitter State/Country Code</h3>
                <select v-model="txStateCountryCodeSelection">
                    <option disabled value=""></option>
                    <option v-for="txStateCountryCode in options.txStateCountryCodes" :value="txStateCountryCode">
                        {{ txStateCountryCode }}
                    </option>
                </select>
                <button @click="add('tx_state_country_code')" :disabled="txStateCountryCodeSelection === ''">Add</button>
            </div>
            <div class="divider" />
            <div class="inputLine">
                <h3 class="inputLabel">Receiver State/Country Code</h3>
                <select v-model="rxStateCountryCodeSelection">
                    <option disabled value=""></option>
                    <option v-for="rxStateCountryCode in options.rxStateCountryCodes" :value="rxStateCountryCode">
                        {{ rxStateCountryCode }}
                    </option>
                </select>
                <button @click="add('rx_state_country_code')" :disabled="rxStateCountryCodeSelection === ''">Add</button>
            </div>
            <div class="divider" />
            <div class="inputLine">
                <h3 class="inputLabel">Transmitter Antenna Location</h3>
                <select v-model="txAntennaLocationSelection">
                    <option disabled value=""></option>
                    <option v-for="txAntennaLocation in options.txAntennaLocations" :value="txAntennaLocation">
                        {{ txAntennaLocation }}
                    </option>
                </select>
                <button @click="add('tx_antenna_location')" :disabled="txAntennaLocationSelection === ''">Add</button>
            </div>
            <div class="divider" />
            <div class="inputLine">
                <h3 class="inputLabel">Receiver Antenna Location</h3>
                <select v-model="rxAntennaLocationSelection">
                    <option disabled value=""></option>
                    <option v-for="rxAntennaLocation in options.rxAntennaLocations" :value="rxAntennaLocation">
                        {{ rxAntennaLocation }}
                    </option>
                </select>
                <button @click="add('rx_antenna_location')" :disabled="rxAntennaLocationSelection === ''">Add</button>
            </div>
            <div class="divider" />
            <div class="inputLine">
                <h3 class="inputLabel">Station Class</h3>
                <select v-model="stationClassSelection">
                    <option disabled value=""></option>
                    <option v-for="stationClass in options.stationClasses" :value="stationClass">
                        {{ stationClass }}
                    </option>
                </select>
                <button @click="add('station_class')" :disabled="stationClassSelection === ''">Add</button>
            </div>
            <div class="divider" />
            <div class="inputLine">
                <h3 class="inputLabel">Function Identifier</h3>
                <select v-model="functionIdentifierSelection">
                    <option disabled value=""></option>
                    <option v-for="functionIdentifier in options.functionIdentifiers" :value="functionIdentifier">
                        {{ functionIdentifier }}
                    </option>
                </select>
                <button @click="add('function_identifier')" :disabled="functionIdentifierSelection === ''">Add</button>
            </div>
            <div class="divider" />
            <!-- Results Columns -->
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
            <div v-show="queryString != ''">
                <pre>{{ queryString }}</pre>
            </div>
            <div class="inputLine">
                <button @click="($event) => search(query)" :disabled="Object.keys(query).length == 0">Search</button>
                <button @click="clear">Clear</button>
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

pre {
    font-family: inherit;
}
</style>