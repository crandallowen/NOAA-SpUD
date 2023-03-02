<script setup>
import { ref, reactive, computed } from 'vue';
import { formatFrequency, frequencyToKHz, headerMap, defaultColumns } from '@/js/utils';

const props = defineProps({
    bureaus: Array,
    columns: Array
});

const conditionExpected = ref(true);
const input = reactive({});
const serialNumInput = ref('');
const serialNumRelation = ref('');
const frequencyInput = ref('');
const frequencyRelation = ref('');
const bureauSelection = ref('');
const resultsColumns = ref([...defaultColumns]);
const setOperator = ref('');
const query = ref([]);
const numericRelations = ref(['==', '>=', '>', '<=', '<', '!=']);
const setOperators = ref(['AND', 'OR', 'NOT', '(', ')']);

const queryString = computed(() => {
    let queryString = '';
    query.value.forEach((queryObject) => {
        if (setOperators.value.includes(queryObject)) {
            if (['(', ')'].includes(queryObject)) {
                queryString += queryObject;
            } else if (queryObject == 'NOT') {
                queryString += queryObject+' '
            } else
                queryString += ' '+queryObject+' ';
        } else {
            if (queryObject.field == 'frequency_khz') {
                queryString += headerMap(queryObject.field) + ' ' + queryObject.relation + ' ' + formatFrequency(queryObject.value);
            } else {
                queryString += headerMap(queryObject.field) + ' ' + queryObject.relation + ' ' + queryObject.value;
            }
        }
    });
    return queryString;
});

function add(event) {
    if (event.srcElement.id == 'serial_num') {
        if (serialNumInput.value != '' && serialNumRelation.value != '') {
            query.value.push({field: 'serial_num', relation: serialNumRelation.value, value: serialNumInput.value});
            serialNumInput.value = '';
            serialNumRelation.value = '';
            conditionExpected.value = false;
        } else {
            // serialNumInput.value = '';
            // serialNumRelation.value = '';
            console.log('Invalid serial_num add');
        }
    } else if (event.srcElement.id == 'frequency') {
        if (frequencyInput.value != '') {
            let frequency_khz = frequencyToKHz(frequencyInput.value);
            if (frequencyRelation.value != '' && frequency_khz) {
                query.value.push({field: 'frequency_khz', relation: frequencyRelation.value, value: frequency_khz});
                frequencyInput.value = '';
                frequencyRelation.value = '';
                conditionExpected.value = false;
            } else {
                if (!frequency_khz) {
                    // frequencyInput.value = '';
                    // frequencyRelation.value = '';
                    console.log('Invalid frequency:', frequencyInput.value);
                } else {
                    // frequencyInput.value = '';
                    // frequencyRelation.value = '';
                    console.log('Invalid frequency add:', frequency_khz, ',', frequencyRelation.value);
                }
            }
        } else {
            // frequencyInput.value = '';
            // frequencyRelation.value = '';
            console.log('Empty frequency add');
        }
    } else if (event.srcElement.id == 'bureau') {
        if (bureauSelection.value != '') {
            query.value.push({field: 'bureau', relation: '==', value: bureauSelection.value});
            bureauSelection.value = '';
            conditionExpected.value = false;
        } else {
            // bureauSelection.value = '';
            console.log('Empty bureau add');
        }
    } else if (event.srcElement.id == 'setOperator') {
        if (setOperator.value != '') {
            if (conditionExpected.value) {
                if (setOperator.value == '(') {
                    query.value.push(setOperator.value);
                    setOperator.value = '';
                } else if (setOperator.value == 'NOT') {
                    if (query.value.length > 0 && query.value[query.value.length-1] != 'NOT') {
                        query.value.push(setOperator.value);
                        setOperator.value = '';
                    } else {
                        console.log('Invalid set operator add: double negative')
                    }
                } else {
                    console.log('Invalid set operator add: Condition, \'(\', or \'NOT\' expected')
                }
            } else {
                if (['AND', 'OR'].includes(setOperator.value)) {
                    query.value.push(setOperator.value);
                    setOperator.value = '';
                    conditionExpected.value = true;
                } else if (setOperator.value == ')') {
                    // Need to validate close parantheses
                    query.value.push(setOperator.value);
                    setOperator.value = '';
                } else {
                    console.log('Invalid set operator add: \')\', \'AND\', or \'OR\' expected');
                }
            }
        } else {
            console.log('Empty set operator add');
        }
    }
    console.log(queryString.value);
}

function search(query, conditionExpected) {
    console.log('Search');
    $emit('search', {query, conditionExpected});
}

function clear() {
    conditionExpected.value = true;
    query.value = [];
}

</script>

<template>
    <h1>Search</h1>
    <div id="searchInputs">
        <div id="conditionInputs">
            <h3>Serial Number</h3>
            <div class="inputLine">
                <input v-model="serialNumInput" />
                <select v-model="serialNumRelation">
                    <option disabled value=""></option>
                    <option v-for="relation in numericRelations" :value="relation">
                        {{ relation }}
                    </option>
                </select>
                <button @click="add" id="serial_num" :disabled="!conditionExpected">Add</button>
            </div>
            <h3>Frequency</h3>
            <div class="inputLine">
                <input v-model="frequencyInput" />
                <select v-model="frequencyRelation">
                    <option disabled value=""></option>
                    <option v-for="relation in numericRelations" :value="relation">
                        {{ relation }}
                    </option>
                </select>
                <button @click="add" id="frequency" :disabled="!conditionExpected">Add</button>
            </div>
            <h3>Bureau</h3>
            <div class="inputLine">
                <select v-model="bureauSelection">
                    <option disabled value="">Please select one</option>
                    <option v-for="bureau in props.bureaus" :value="bureau">
                        {{ bureau }}
                    </option>
                </select>
                <button @click="add" id="bureau" :disabled="!conditionExpected">Add</button>
            </div>
            <h3 id="resultsColumns">Result Columns</h3>
            <div class="columns">
                <template v-for="column in props.columns">
                    <div class="inputLine">
                        <input type="checkbox" :id="column" :value="column" v-model="resultsColumns">
                        <label :for="column">{{ headerMap(column) }}</label>
                    </div>
                </template>
            </div>
        </div>
        <div class="divider" />
        <div id="setOperators">
            <h3>Set Operator</h3>
            <div class="inputLine">
                <select v-model="setOperator" >
                    <option v-for="operator in setOperators" :value="operator">
                        {{ operator }}
                    </option>
                </select>
                <button @click="add" id="setOperator">Add</button>
            </div>
        </div>
        <div class="divider" />
        <div id="queryDisplay">
            <h3>Query</h3>
            <div id="queryString">{{ queryString }}</div>
            <div class="divider" />
            <div class="inputLine">
                <button @click="($event) => $emit('search', query)">Search</button>
                <button @click="clear">clear</button>
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
    height: var(--small-section-gap);
}

#resultsColumns {
    margin-top: 15px;
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