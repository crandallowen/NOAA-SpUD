<script setup>
import { ref, reactive, computed, watch, watchEffect } from 'vue';
import { frequencyStringToHz, headerMap, allColumns, format, appendCommerceSerialNumber, isShortSerialNumber } from '@/js/utils';
import { useSearchResultsStore } from '@/stores/searchResults';
import { useAuthStore } from '@/stores/auth';
import router from '@/router';

const options = ref({});
const store = useSearchResultsStore();
const auth = useAuthStore();

watch(store, (store) => {
    localStorage.setItem(store.$id, JSON.stringify(store))
}, {deep: true});

watchEffect(async () => {
    let url = new URL(`${window.location.origin}/api/getOptions`);
    const response = await fetch(url, {credentials: 'include'});
    if ([401, 403].includes(response.status)) {
        auth.returnURL = router.currentRoute.value.fullPath;
        router.push('/login');
    } else {
        response.json()
            .then((response) => {
                options.value = response;
            });
    }
});

const input = reactive({
    serial_num: {
        value: '',
        lowerValue: '',
        relation: '',
    },
    center_frequency: {
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
const numericRelations = ['=', '>=', '>', '<=', '<', '!=', 'between'];

function formatParameter(field, param) {
    if (field === 'serial_num' || field === 'center_frequency') {
        if (param.relation !== 'between')
            return `${headerMap(field)} ${param.relation} ${format(param.value, field)}`;
        else
            return `${headerMap(field)} ${param.relation} ${format(param.lowerValue, field)} and ${format(param.higherValue, field)}`;
    } else {
        return param.value;
    }
};

const queryParams = computed(() => {
    let queryParams = [];
    if (Object.keys(store.params).length != 0) {
        for (const field in store.params)
            for (const condition of store.params[field])
                queryParams.push({field: field, ...condition.parameters});
    }
    return queryParams;
});

function add(field) {
    if (!Object.hasOwn(store.params, field))
        store.params[field] = [];
    let parameters;
    if (field === 'serial_num') {
        if (input.serial_num.relation != 'between') {
            parameters = {
                relation: input.serial_num.relation,
                value: isShortSerialNumber(input.serial_num.value) ? appendCommerceSerialNumber(input.serial_num.value) : input.serial_num.value,
            };
            input.serial_num.value = '';
            input.serial_num.relation = '';
        } else {
            parameters = {
                relation: input.serial_num.relation,
                lowerValue: isShortSerialNumber(input.serial_num.lowerValue) ? appendCommerceSerialNumber(input.serial_num.lowerValue) : input.serial_num.lowerValue,
                higherValue: isShortSerialNumber(input.serial_num.value) ? appendCommerceSerialNumber(input.serial_num.value) : input.serial_num.value,
            };
            input.serial_num.value = '';
            input.serial_num.lowerValue = '';
            input.serial_num.relation = '';
        }
    } else if (field === 'center_frequency') {
        let center_frequency = frequencyStringToHz(input.center_frequency.value);
        if (input.center_frequency.relation != 'between') {
            parameters = {
                relation: input.center_frequency.relation,
                value: center_frequency
            };
            input.center_frequency.value = '';
            input.center_frequency.relation = '';
        } else {
            let frequencyLower_khz = frequencyStringToHz(input.center_frequency.lowerValue);
            parameters = {
                relation: input.center_frequency.relation,
                lowerValue: frequencyLower_khz,
                higherValue: center_frequency
            };
            input.center_frequency.value = '';
            input.center_frequency.lowerValue = '';
            input.center_frequency.relation = '';
        }
    } else if (['bureau', 'tx_state_country_code', 'rx_state_country_code', 'tx_antenna_location', 'rx_antenna_location', 'station_class', 'function_identifier'].includes(field)) {
        parameters = {
            value: input[field]
        };
        input[field] = '';
    }
    store.params[field].push({
        parameters: parameters,
    });
    console.log(store.params)
};

function remove(field, index) {
    store.params[field].splice(index, 1);
    if (store.params[field].length === 0) delete store.params[field];
};

function search() {
    store.params = [...queryParams.value];
    router.push({name: 'searchResults', params: [...queryParams.value]});
};

function clear() {
    for (const field in store.params) delete store.params[field];
};

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
                <select v-model="input.center_frequency.relation">
                    <option disabled value=""></option>
                    <option v-for="relation in numericRelations" :value="relation">
                        {{ relation }}
                    </option>
                </select>
                <div v-show="input.center_frequency.relation === 'between'" class="inputLine">
                    <input v-model="input.center_frequency.lowerValue" />
                    <p class="inputSeperator">and</p>
                </div>
                <input v-model="input.center_frequency.value" />
                <button @click="add('center_frequency')" :disabled="input.center_frequency.relation === '' || input.center_frequency.value === '' || (input.center_frequency.relation === 'between' && input.center_frequency.lowerValue === '')">Add</button>
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
                        <input type="checkbox" :id="column" :value="column" v-model="store.displayColumns">
                        <label :for="column">{{ headerMap(column) }}</label>
                    </div>
                </template>
            </div>
        </div>
        <div class="divider" />
        <div class="divider" />
        <div id="queryDisplay">
            <div v-show="Object.keys(store.params).length !== 0">
                <div v-for="field in Object.keys(store.params)" class="queryDisplayField">
                    <p v-show="!['serial_number', 'center_frequency'].includes(field)">{{ `${headerMap(field)} in [` }}</p>
                        <template v-for="(condition, index) in store.params[field]" class="queryDisplayCondition">
                            {{ formatParameter(field, condition.parameters) }}
                            <button @click="remove(field, index)">x</button>
                            <p v-show="!['serial_number', 'center_frequency'].includes(field) && index !== store.params[field].length-1">,&nbsp;</p>
                            <p v-show="['serial_number', 'center_frequency'].includes(field) && index !== store.params[field].length-1">&nbsp;OR&nbsp;</p>
                        </template>
                    <p v-show="!['serial_number', 'center_frequency'].includes(field)">]</p>
                </div>
            </div>
            <div class="inputLine">
                <button @click="search" :disabled="Object.keys(store.params).length === 0">Search</button>
                <button @click="clear">Clear</button>
            </div>
        </div>
    </div>
</template>

<style scoped>
#queryDisplay {
    display: flex;
    flex-direction: column;
}

.inputLine, .queryDisplayField, #searchInputs {
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

select, button {
    cursor: pointer;
}

button {
    font-family: inherit;
}

label, input, select, button {
    padding: 2px 5px;
}

pre {
    font-family: inherit;
}

button:disabled, button[disabled] {
    color: var(--color-text-inactive);
    cursor: default;
}
</style>