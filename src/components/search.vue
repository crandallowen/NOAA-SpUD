<script setup>
import { ref, reactive, computed, watchEffect } from 'vue';
import { frequencyToKHz, headerMap, allColumns } from '@/js/utils';
import { searchResultsTable } from '@/js/state';

const emit = defineEmits(['search']);

const options = ref({});

watchEffect(async () => {
    let url = new URL('http://localhost:7007/getOptions');
    const response = await fetch(url);
    await response.json()
        .then((response) => {
            console.log(response);
            options.value = response;
        })
});

const serialNumRelation = ref('');
const serialNumInputLower = ref('');
const serialNumInput = ref('');
const serialNums = ref([]);
const frequencyRelation = ref('');
const frequencyInputLower = ref('');
const frequencyInput = ref('');
const frequencies = ref([]);
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
const functionIdentifierSelection = ref([]);
const functionIdentifiers = ref([]);
const numericRelations = ['==', '>=', '>', '<=', '<', '!=', 'between'];

const query = computed(() => {
    return {
        'serial_num': serialNums.value,
        'frequency': frequencies.value,
        'bureau': bureaus.value
    };
});
//need to handle 'between' operator
function add(field) {
    if (field === 'serial_num') {
        if (serialNumRelation.value != 'between') {
            serialNums.value.push({relation: serialNumRelation.value, value: serialNumInput.value});
            serialNumInput.value = '';
            serialNumRelation.value = '';
        } else {
            
        }
    } else if (field === 'frequency') {
        let frequency_khz = frequencyToKHz(frequencyInput.value);
        if (frequencyRelation.value != 'between') {
            if (frequency_khz) {
                frequencies.value.push({relation: frequencyRelation.value, value: frequency_khz});
                frequencyInput.value = '';
                frequencyRelation.value = '';
            } else {
                console.log('Invalid frequency:', frequencyInput.value);
            }
        } else {
            let frequencyLower_khz = frequencyToKHz(frequencyInputLower.value);
            if (frequency_khz && frequencyLower_khz) {
                frequencies.value.push({relation: '>=', value: frequencyLower_khz});
                frequencies.value.push({relation: '<=', value: frequency_khz});
            } else {
                if (!frequency_khz) {
                    console.log('Invalid frequency:', frequencyInput.value);
                } else {
                    console.log('Invalid frequency:', frequencyInputLower.value);
                }
            }
        }
    } else if (field == 'bureau') {
        bureaus.value.push(bureauSelection.value);
        bureauSelection.value = '';
    } else if (field === 'tx_state_country_code') {
        txStateCountryCodes.value.push(txStateCountryCodeSelection.value);
        txStateCountryCodeSelection.value = '';
    } else if (field === 'rx_state_country_code') {
        rxStateCountryCodes.value.push(rxStateCountryCodeSelection.value);
        rxStateCountryCodeSelection.value = '';
    } else if (field === 'tx_antenna_location') {
        txAntennaLocations.value.push(txAntennaLocationSelection.value);
        txAntennaLocationSelection.value = '';
    } else if (field === 'rx_antenna_location') {
        rxAntennaLocations.value.push(rxAntennaLocationSelection.value);
        rxAntennaLocationSelection.value = '';
    } else if (field === 'station_class') {
        stationClasses.value.push(stationClassSelection.value);
        stationClassSelection.value = '';
    } else if (field === 'function_identifier') {
        functionIdentifiers.value.push(functionIdentifierSelection.value);
        functionIdentifierSelection.value = '';
    }
    console.log(query.value);
}

function search(query, conditionExpected) {
    console.log('Search');
    emit('search');
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
                <button @click="add('serial_num')" :disabled="serialNumRelation === '' && serialNumInput === '' || (serialNumRelation === 'between' && serialNumInputLower === '')">Add</button>
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
                <button @click="add('frequency')" :disabled="frequencyRelation === '' && frequencyInput === '' || (frequencyRelation === 'between' && frequencyInputLower === '')">Add</button>
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