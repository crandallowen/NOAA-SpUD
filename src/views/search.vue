<script setup>
import { ref, reactive, computed, watchEffect } from 'vue';
import { frequencyToKHz, headerMap, defaultColumns, allColumns, format } from '@/js/utils';
import { searchResultsState } from '@/js/state'
import router from '@/router'

// const emit = defineEmits(['search']);

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

const input = reactive({
    serial_num: {
        value: '',
        lowerValue: '',
        relation: '',
    },
    frequency: {
        value: '',
        lowerValue: '',
        relation: '',
    },
    bureau: '',
    tx_state_country_code: '',
    rx_state_country_code: '',
    tx_antenna_location: '',
    rx_antenna_location: '',
    station_class: '',
    function_identifier: ''
});
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
            if (query.value[i].field === 'serial_num' || query.value[i].field === 'center_frequency') {
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
            if (field === 'serial_num' || field === 'center_frequency')
                queryList.push(`${headerMap(field)} ${queryObject[field].join(' OR ')}`);
            else
                queryList.push(`${headerMap(field)} in [${queryObject[field].join(', ')}]`)
        }
        queryString = queryList.join('\n');
    }
    return queryString;
});

function add(field) {
    //Need to catch invalid serial numbers (greater than 6 digits) or includes leading 'C   '
    if (field === 'serial_num') {
        if (input.serial_num.relation != 'between') {
            query.value.push({field: field, relation: input.serial_num.relation, value: input.serial_num.value});
            input.serial_num.value = '';
            input.serial_num.relation = '';
        } else {
            query.value.push({field: field, relation: input.serial_num.relation, lowerValue: input.serial_num.lowerValue, higherValue: input.serial_num.value});
            input.serial_num.value = '';
            input.serial_num.lowerValue = '';
            input.serial_num.relation = '';
        }
    } else if (field === 'center_frequency') {
        let center_frequency = frequencyToKHz(input.frequency.value);
        if (input.frequency.relation != 'between') {
            if (center_frequency) {
                query.value.push({field: field, relation: input.frequency.relation, value: center_frequency});
                input.frequency.value = '';
                input.frequency.relation = '';
            } else {
                console.log('Invalid frequency:', input.frequency.value);
            }
        } else {
            let frequencyLower_khz = frequencyToKHz(input.frequency.lowerValue);
            if (center_frequency && frequencyLower_khz) {
                query.value.push({field: field, relation: input.frequency.relation, lowerValue: frequencyLower_khz, higherValue: center_frequency});
                input.frequency.value = '';
                input.frequency.lowerValue = '';
                input.frequency.relation = '';
            } else {
                if (!center_frequency) {
                    console.log('Invalid frequency:', input.frequency.value);
                } else {
                    console.log('Invalid frequency:', input.frequency.lowerValue);
                }
            }
        }
    } else if (field == 'bureau') {
        query.value.push({field: field, value: input.bureau});
        input.bureau = '';
    } else if (field === 'tx_state_country_code') {
        query.value.push({field: field, value: input.tx_state_country_code});
        input.tx_state_country_code = '';
    } else if (field === 'rx_state_country_code') {
        query.value.push({field: field, value: input.rx_state_country_code});
        input.rx_state_country_code = '';
    } else if (field === 'tx_antenna_location') {
        query.value.push({field: field, value: input.tx_antenna_location});
        input.tx_antenna_location = '';
    } else if (field === 'rx_antenna_location') {
        query.value.push({field: field, value: input.rx_antenna_location});
        input.rx_antenna_location = '';
    } else if (field === 'station_class') {
        query.value.push({field: field, value: input.station_class});
        input.station_class = '';
    } else if (field === 'function_identifier') {
        query.value.push({field: field, value: input.function_identifier});
        input.function_identifier = '';
    }
    // console.log(query.value);
}

function search() {
    searchResultsState.params = [...query.value];
    // emit('search');
    router.push({name: 'searchResults', params: [...query.value]});
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
                <select v-model="input.serial_num.relation">
                    <option disabled value=""></option>
                    <option v-for="relation in numericRelations" :value="relation">
                        {{ relation }}
                    </option>
                </select>
                <div v-show="input.serial_num.relation === 'between'" class="inputLine">
                    <input v-model="input.serial_num.lowerValue" />
                    <p class="inputSeperator">and</p>
                </div>
                <input v-model="input.serial_num.value" />
                <button @click="add('serial_num')" :disabled="input.serial_num.relation === '' || input.serial_num.value === '' || (input.serial_num.relation === 'between' && input.serial_num.lowerValue === '')">Add</button>
            </div>
            <div class="divider" />
            <div class="inputLine">
                <h3 class="inputLabel">Frequency</h3>
                <select v-model="input.frequency.relation">
                    <option disabled value=""></option>
                    <option v-for="relation in numericRelations" :value="relation">
                        {{ relation }}
                    </option>
                </select>
                <div v-show="input.frequency.relation === 'between'" class="inputLine">
                    <input v-model="input.frequency.lowerValue" />
                    <p class="inputSeperator">and</p>
                </div>
                <input v-model="input.frequency.value" />
                <button @click="add('center_frequency')" :disabled="input.frequency.relation === '' || input.frequency.value === '' || (input.frequency.relation === 'between' && input.frequency.lowerValue === '')">Add</button>
            </div>
            <div class="divider" />
            <div class="inputLine">
                <h3 class="inputLabel">Bureau</h3>
                <select v-model="input.bureau">
                    <option disabled value=""></option>
                    <option v-for="bureau in options['bureau']" :value="bureau">
                        {{ bureau }}
                    </option>
                </select>
                <button @click="add('bureau')" :disabled="input.bureau === ''">Add</button>
            </div>
            <div class="divider" />
            <div class="inputLine">
                <h3 class="inputLabel">Transmitter State/Country Code</h3>
                <select v-model="input.tx_state_country_code">
                    <option disabled value=""></option>
                    <option v-for="txStateCountryCode in options['tx_state_country_code']" :value="txStateCountryCode">
                        {{ txStateCountryCode }}
                    </option>
                </select>
                <button @click="add('tx_state_country_code')" :disabled="input.tx_state_country_code === ''">Add</button>
            </div>
            <div class="divider" />
            <div class="inputLine">
                <h3 class="inputLabel">Receiver State/Country Code</h3>
                <select v-model="input.rx_state_country_code">
                    <option disabled value=""></option>
                    <option v-for="rxStateCountryCode in options['rx_state_country_code']" :value="rxStateCountryCode">
                        {{ rxStateCountryCode }}
                    </option>
                </select>
                <button @click="add('rx_state_country_code')" :disabled="input.rx_state_country_code === ''">Add</button>
            </div>
            <div class="divider" />
            <div class="inputLine">
                <h3 class="inputLabel">Transmitter Antenna Location</h3>
                <select v-model="input.tx_antenna_location">
                    <option disabled value=""></option>
                    <option v-for="txAntennaLocation in options['tx_antenna_location']" :value="txAntennaLocation">
                        {{ txAntennaLocation }}
                    </option>
                </select>
                <button @click="add('tx_antenna_location')" :disabled="input.tx_antenna_location === ''">Add</button>
            </div>
            <div class="divider" />
            <div class="inputLine">
                <h3 class="inputLabel">Receiver Antenna Location</h3>
                <select v-model="input.rx_antenna_location">
                    <option disabled value=""></option>
                    <option v-for="rxAntennaLocation in options['rx_antenna_location']" :value="rxAntennaLocation">
                        {{ rxAntennaLocation }}
                    </option>
                </select>
                <button @click="add('rx_antenna_location')" :disabled="input.rx_antenna_location === ''">Add</button>
            </div>
            <div class="divider" />
            <div class="inputLine">
                <h3 class="inputLabel">Station Class</h3>
                <select v-model="input.station_class">
                    <option disabled value=""></option>
                    <option v-for="stationClass in options['station_class']" :value="stationClass">
                        {{ stationClass }}
                    </option>
                </select>
                <button @click="add('station_class')" :disabled="input.station_class === ''">Add</button>
            </div>
            <div class="divider" />
            <div class="inputLine">
                <h3 class="inputLabel">Function Identifier</h3>
                <select v-model="input.function_identifier">
                    <option disabled value=""></option>
                    <option v-for="functionIdentifier in options['function_identifier']" :value="functionIdentifier">
                        {{ functionIdentifier }}
                    </option>
                </select>
                <button @click="add('function_identifier')" :disabled="input.function_identifier === ''">Add</button>
            </div>
            <div class="divider" />
            <!-- Results Columns -->
            <h3>Result Columns</h3>
            <div class="columns">
                <template v-for="column in allColumns">
                    <div class="inputLine">
                        <input type="checkbox" :id="column" :value="column" v-model="searchResultsState.displayColumns">
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
                <button @click="search" :disabled="Object.keys(query).length == 0">Search</button>
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