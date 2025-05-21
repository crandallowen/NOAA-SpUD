<script setup>
import { ref, reactive, computed, watch } from 'vue';
import { frequencyStringToHz, headerMap, format, formatDateYYYYMMDD, appendCommerceSerialNumber, isShortSerialNumber } from '@/js/utils';
import { useSearchResultsStore } from '@/stores/table';
import { getOptions } from '@/js/api';
import searchInput from '@/components/searchInput.vue';
import router from '@/router';

const options = ref({});
const store = useSearchResultsStore();
const input = reactive({
    serial_number: {
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

watch(store, (store) => {localStorage.setItem(store.$id, JSON.stringify({
    sort: {...store.sort},
    displayColumns: [...store.displayColumns],
    filters: [...store.filters],
    params: store.params.map((param) => {return {...param}}),
    // savedQueries: structuredClone(store.savedQueries),
}))}, {deep: true});
getOptions().then((data) => {if(data) {options.value = data;}});

function formatParameter(field, param) {
    if (['serial_number', 'center_frequency', 'review_date', 'expiration_date', 'revision_date'].includes(field)) {
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
            if (['serial_number', 'center_frequency', 'review_date', 'expiration_date', 'revision_date'].includes(param.field)) {
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
    if (['serial_number', 'center_frequency', 'review_date', 'expiration_date', 'revision_date'].includes(field)) {
        parameters.relation = input[field].relation;
        switch (field) {
            case 'serial_number':
                parameters.value = isShortSerialNumber(input.serial_number.value) ? appendCommerceSerialNumber(input.serial_number.value) : input.serial_number.value;
                if (input[field].relation === 'between') {parameters.lowerValue = isShortSerialNumber(input.serial_number.lowerValue) ? appendCommerceSerialNumber(input.serial_number.lowerValue) : input.serial_number.lowerValue;}
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
    <div id="container">
        <div id="leftColumn" class="flexColumn">
            <h1 id="title">Search</h1>
            <!-- Search Inputs -->
            <div id="conditionInputs" class="flexColumn">
                <template v-for="field in Object.keys(input)">
                    <template v-if="input[field].type === 'categoric'">
                        <searchInput :field="field" :options="options[field]" v-model="input[field]" @add="add"/>
                    </template>
                    <template v-else>
                        <searchInput :field="field" v-model="input[field]" @add="add"/>
                    </template>
                </template>
            </div>
        </div>
        <div id="rightColumn" class="flexColumn">
            <div id="infoBox" class="flexColumn">
                <p>To create a search query, first add parameters by filling an input on the left and clicking the associated 'Add' button.</p>
                <p>User input is validated before being added, so the 'Add' button will be greyed out until the input is valid.</p>
                <p>Multiple parameters can be added for each field and will be combined with a logical 'or'.</p>
                <p>As parameters are added, the query will be built below in the 'Query Parameters' box.</p>
                <p>Once all conditions have been added, click the 'Search' button to see the results.</p>
                <!-- <p>Serial numbers that are 6 or fewer characters long will have 'C   ' appended to the front and a number of 0's will be added to the end to create a valid, 10-digit serial number.</p>
                <p>Frequencies must include a number and can also include a unit represented fully (e.g. kHz) or with a single character (e.g. k).</p> -->
            </div>
            <div id="queryDisplay" class="flexColumn">
                <div class="flexRow">
                    <h3>Query Parameters:</h3>
                    <button @click="store.clearParams()">Clear</button>
                </div>
                <div v-for="field in Object.keys(queryObject)" class="queryDisplayField flexRow">
                    <p>
                        <span v-if="['bureau', 'tx_state_country_code', 'rx_state_country_code', 'tx_antenna_location', 'rx_antenna_location', 'station_class', 'function_identifier'].includes(field)">{{ `${headerMap(field)} in [` }}</span>
                        <span v-if="['supplementary_details'].includes(field)">{{ `${headerMap(field)} contains` }}&nbsp;</span>
                        <template v-for="(param, index) in queryObject[field]">
                            <span>{{ formatParameter(field, param) }}</span>
                            <button @click="store.removeParam(param.index)" class="xButton">&#10006;</button>
                            <span v-if="['bureau', 'tx_state_country_code', 'rx_state_country_code', 'tx_antenna_location', 'rx_antenna_location', 'station_class', 'function_identifier'].includes(field) && index !== queryObject[field].length-1">,&nbsp;</span>
                            <span v-if="['supplementary_details'].includes(field) && queryObject[field].length >= 3 && index <= queryObject[field].length-1">,&nbsp;</span>
                            <span v-if="['supplementary_details'].includes(field) && queryObject[field].length >= 2 && index === queryObject[field].length-2">OR&nbsp;</span>
                            <span v-if="['serial_number', 'center_frequency', 'review_date', 'expiration_date', 'revision_date'].includes(field) && index !== queryObject[field].length-1">&nbsp;OR&nbsp;</span>
                        </template>
                        <span v-if="['bureau', 'tx_state_country_code', 'rx_state_country_code', 'tx_antenna_location', 'rx_antenna_location', 'station_class', 'function_identifier'].includes(field)">]</span>
                    </p>
                </div>
            </div>
            <button @click="search" :disabled="Object.keys(store.params).length === 0">Search</button>
        </div>
    </div>
</template>
<style scoped>
#container {
    display: flex;
    justify-content: center;
    width: 66vw;
    margin: 0 auto;
}

#title, h3 {
    color: var(--color-heading);
}

h3 {
    flex-grow: 1;
}

#infoBox, #queryDisplay {
    padding: 8px 16px;
    background: var(--color-background-mute);
    border-radius: 4px;
}

#infoBox {
    margin-bottom: 20px;
}

#queryDisplay {
    min-height: 180px;
    margin-bottom: 8px;
}

#leftColumn {
    flex-grow: 1;
    margin-right: 4px;
}

#rightColumn {
    max-width: 30vw;
}

.xButton {
    color: red;
    font-size: 10px;
    padding: 0 3.5px;
    height: 18px;
    bottom: 2px;
}

#infoBox > p:last-child {
    margin-bottom: 0;
}

#infoBox > p {
    margin-bottom: 8px;
}

.queryDisplayField > p {
    padding-left: 20px;
}

.queryDisplayField > p::first-letter {
    margin-left: -20px;
}
</style>