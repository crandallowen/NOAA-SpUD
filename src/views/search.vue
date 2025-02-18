<script setup>
import { ref, reactive, computed, watch } from 'vue';
import { frequencyStringToHz, headerMap, allColumns, format, formatDateYYYYMMDD, appendCommerceSerialNumber, isShortSerialNumber } from '@/js/utils';
import { useSearchResultsStore } from '@/stores/table';
import { getOptions } from '@/js/api';
import searchInput from '@/components/searchInput.vue';
import router from '@/router';

const options = ref({});
const store = useSearchResultsStore();
const input = reactive({
    serial_num: {
        value: '',
        lowerValue: '',
        relation: '',
        type: 'numeric',
    },
    center_frequency: {
        value: '',
        lowerValue: '',
        relation: '',
        type: 'numeric',
    },
    bureau: {
        value: '',
        type: 'categoric',
    },
    supplementary_details: {
        value: '',
        type: 'text',
    },
    tx_state_country_code: {
        value: '',
        type: 'categoric',
    },
    rx_state_country_code: {
        value: '',
        type: 'categoric',
    },
    tx_antenna_location: {
        value: '',
        type: 'categoric',
    },
    rx_antenna_location: {
        value: '',
        type: 'categoric',
    },
    station_class: {
        value: '',
        type: 'categoric',
    },
    function_identifier: {
        value: '',
        type: 'categoric',
    },
    review_date: {
        value: '',
        lowerValue: '',
        relation: '',
        type: 'numeric',
    },
    expiration_date: {
        value: '',
        lowerValue: '',
        relation: '',
        type: 'numeric',
    },
    revision_date: {
        value: '',
        lowerValue: '',
        relation: '',
        type: 'numeric',
    }
});

watch(store, (store) => {
    localStorage.setItem(store.$id, JSON.stringify(store))
}, {deep: true});
getOptions(options);

function formatParameter(field, param) {
    if (['serial_num', 'center_frequency', 'review_date', 'expiration_date', 'revision_date'].includes(field)) {
        // Will remove this if-clause when format() detects date format input
        if (['review_date', 'expiration_date', 'revision_date'].includes(field)) {
            if (param.relation !== 'between')
                return `${headerMap(field)} ${param.relation} ${formatDateYYYYMMDD(param.value)}`;
            else
                return `${headerMap(field)} ${param.relation} ${formatDateYYYYMMDD(param.lowerValue)} and ${formatDateYYYYMMDD(param.value)}`;
        } else {
            if (param.relation !== 'between')
                return `${headerMap(field)} ${param.relation} ${format(param.value, field)}`;
            else
                return `${headerMap(field)} ${param.relation} ${format(param.lowerValue, field)} and ${format(param.value, field)}`;
        }
    } else {
        return param.value;
    }
};

const queryObject = computed(() => {
    let queryObject = {};
    if (store.params.length !== 0) {
        for (const [index, param] of store.params.entries()) {
            let temp = {};
            temp.index = index;
            if (!Object.hasOwn(queryObject, param.field))
                queryObject[param.field] = [];
            if (['serial_num', 'center_frequency', 'review_date', 'expiration_date', 'revision_date'].includes(param.field)) {
                temp.relation = param.relation;
                if (param.relation === 'between') {
                    temp.lowerValue = param.lowerValue;
                    temp.value = param.value;
                } else {
                    temp.value = param.value;
                }
            } else {
                temp.value = param.value;
            }
            queryObject[param.field].push({...temp});
        }
    }
    return queryObject;
});

function add(field) {
    let parameters = {};
    parameters.field = field;
    if (['serial_num', 'center_frequency', 'review_date', 'expiration_date', 'revision_date'].includes(field)) {
        parameters.relation = input[field].relation;
        switch(field) {
            case 'serial_num':
                parameters.value = isShortSerialNumber(input.serial_num.value) ? appendCommerceSerialNumber(input.serial_num.value) : input.serial_num.value;
                if (input[field].relation === 'between') {parameters.lowerValue = isShortSerialNumber(input.serial_num.lowerValue) ? appendCommerceSerialNumber(input.serial_num.lowerValue) : input.serial_num.lowerValue;}
                break;
            case 'center_frequency':
                parameters.value = frequencyStringToHz(input.center_frequency.value);
                if (input[field].relation === 'between') {parameters.lowerValue = frequencyStringToHz(input.center_frequency.lowerValue);}
                break;
            case 'review_date':
            case 'expiration_date':
            case 'revision_date':
                parameters.value = input[field].value;
                if (input[field].relation === 'between') {parameters.lowerValue = input[field].lowerValue;}
                break;
            default:
                console.log('No field identified in add() switch statement');
        }
        input[field].value = '';
        input[field].lowerValue = '';
        input[field].relation = '';
    } else if (['bureau', 'tx_state_country_code', 'rx_state_country_code', 'tx_antenna_location', 'rx_antenna_location', 'station_class', 'function_identifier'].includes(field)) {
        parameters.value = input[field].value;
        input[field].value = '';
    } else if (['supplementary_details'].includes(field)) {
        parameters.value = input[field].value;
        parameters.relation = 'LIKE';
        input[field].value = '';
    }
    store.params.push({...parameters});
};

function search() {
    router.push({name: 'searchResults'});
};
</script>

<template>
    <h1>Search</h1>
    <div id="searchInputs">
        <!-- Search Inputs -->
        <div id="conditionInputs">
            <template v-for="field in Object.keys(input)">
                <template v-if="input[field].type === 'categoric'">
                    <searchInput :field="field" :options="options[field]" v-model="input[field]" @add="add"/>
                </template>
                <template v-else>
                    <searchInput :field="field" v-model="input[field]" @add="add"/>
                </template>
            </template>
            <!-- Results Columns -->
            <!-- <h3>Result Columns</h3>
            <div class="columns">
                <template v-for="column in allColumns">
                    <div class="inputLine">
                        <input type="checkbox" :id="column" :value="column" v-model="store.displayColumns">
                        <label :for="column">{{ headerMap(column) }}</label>
                    </div>
                </template>
            </div> -->
        </div>
        <div id="queryDisplay">
            <div v-show="Object.keys(queryObject).length !== 0">
                <div v-for="field in Object.keys(queryObject)" class="queryDisplayField">
                    <p v-if="['bureau', 'tx_state_country_code', 'rx_state_country_code', 'tx_antenna_location', 'rx_antenna_location', 'station_class', 'function_identifier'].includes(field)">{{ `${headerMap(field)} in [` }}</p>
                    <p v-if="['supplementary_details'].includes(field)">{{ `${headerMap(field)} contains` }}&nbsp;</p>
                    <template v-for="(param, index) in queryObject[field]">
                        {{ formatParameter(field, param) }}
                        <button @click="store.removeParam(param.index)" class="xButton">&#10006;</button>
                        <p v-if="['bureau', 'tx_state_country_code', 'rx_state_country_code', 'tx_antenna_location', 'rx_antenna_location', 'station_class', 'function_identifier'].includes(field) && index !== queryObject[field].length-1">,&nbsp;</p>
                        <p v-if="['supplementary_details'].includes(field) && queryObject[field].length >= 3 && index <= queryObject[field].length-1">,&nbsp;</p>
                        <p v-if="['supplementary_details'].includes(field) && queryObject[field].length >= 2 && index === queryObject[field].length-2">OR&nbsp;</p>
                        <p v-if="['serial_num', 'center_frequency', 'review_date', 'expiration_date', 'revision_date'].includes(field) && index !== queryObject[field].length-1">&nbsp;OR&nbsp;</p>
                    </template>
                    <p v-if="['bureau', 'tx_state_country_code', 'rx_state_country_code', 'tx_antenna_location', 'rx_antenna_location', 'station_class', 'function_identifier'].includes(field)">]</p>
                </div>
            </div>
            <div class="inputLine">
                <button @click="search" :disabled="Object.keys(store.params).length === 0">Search</button>
                <button @click="store.clearParams()">Clear</button>
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

.columns, #conditionInputs {
    display: flex;
    flex-direction: column;
}

input, button {
    background-color: var(--color-background-soft);
    border: 1px solid var(--color-border);
    color: var(--color-text);
    border-radius: 4px;
    padding: 2px 5px;
}

.xButton {
    color: red;
    font-size: 10px;
    padding: 0 3.5px;
    height: 18px;
    align-self: center;
}

button {
    cursor: pointer;
    font-family: inherit;
}

button:disabled, button[disabled] {
    color: var(--color-text-inactive);
    cursor: default;
}
</style>