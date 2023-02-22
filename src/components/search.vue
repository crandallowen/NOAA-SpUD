<script setup>
import { ref, reactive, computed } from 'vue';
import { formatFrequency, frequencyToKHz, allColumns, headerMap } from '@/js/utils';

defineProps({
    bureaus: Array
});
defineEmits({
    submit(query){

    }
});

const conditionExpected = ref(true);

const serialNumInput = ref('');
const serialNumRelation = ref('');
const frequencyInput = ref('');
const frequencyRelation = ref('');
const bureauSelection = ref('');
const resultsColumns = ref([]);

const setOperator = ref('');

const query = ref([]);

const numericRelations = ref(['==', '>=', '>', '<=', '<', '!=']);

const setOperators = ref(['AND', 'OR', 'NOT', '(', ')']);

function add(event) {
    if (event.srcElement.id == 'serial_num') {
        if (serialNumInput.value != '' && serialNumRelation.value != '') {
            query.value.push({field: 'serial_num', relation: serialNumRelation.value, value: serialNumInput.value});
            serialNumInput.value = '';
            serialNumRelation.value = '';
            conditionExpected.value = false;
            console.log(queryString.value, conditionExpected.value);
        } else {
            // serialNumInput.value = '';
            // serialNumRelation.value = '';
            console.log('Invalid serial_num add.');
        }
    } else if (event.srcElement.id == 'frequency') {
        if (frequencyInput.value != '') {
            let frequency_khz = frequencyToKHz(frequencyInput.value);
            if (frequencyRelation.value != '' && frequency_khz) {
                query.value.push({field: 'frequency_khz', relation: frequencyRelation.value, value: frequency_khz});
                frequencyInput.value = '';
                frequencyRelation.value = '';
                conditionExpected.value = false;
                console.log(queryString.value, conditionExpected.value);
            } else {
                if (!frequency_khz) {
                    // frequencyInput.value = '';
                    // frequencyRelation.value = '';
                    console.log('Invalid frequency.', frequencyInput.value, ',', frequency_khz);
                } else {
                    // frequencyInput.value = '';
                    // frequencyRelation.value = '';
                    console.log('Invalid frequency add.', frequencyInput.value, ',', frequencyRelation.value);
                }
            }
        } else {
            // frequencyInput.value = '';
            // frequencyRelation.value = '';
            console.log('Invalid frequency add.', frequencyInput.value, ',', frequencyRelation.value);
        }
    } else if (event.srcElement.id == 'bureau') {
        if (bureauSelection.value != '' && bureauOperator.value != '') {
            query.value.push({field: 'bureau', relation: '==', value: bureauSelection.value});
            bureauSelection.value = '';
            conditionExpected.value = false;
            console.log(queryString.value, conditionExpected.value);
        } else {
            // bureauSelection.value = '';
            console.log('Invalid bureau add.');
        }
    } else if (event.srcElement.id == 'setOperator') {
        if (setOperator.value != '') {
            if (['(', ')'].includes(setOperator.value)) {
                if (conditionExpected.value) {
                    query.value.push(setOperator.value);
                }
            } else if (!conditionExpected.value) {
                query.value.push(setOperator.value);
                conditionExpected.value = true;
            } else 
                console.log('Invalid set operator add. Condition or parthenses expected');
        } else {
            console.log('Empty set operator add.')
        }
    }
}

const queryString = computed(() => {
    let queryString = '';
    query.value.forEach((queryObject) => {
        if (setOperators.value.includes(queryObject)) {
            if (['(', ')'].includes(queryObject))
                queryString += queryObject;
            else
                queryString += ' '+queryObject+' ';
        } else {
            if (queryObject)
            queryString += headerMap(queryObject.field) + ' ' + queryObject.relation + ' ' + queryObject.value;
        }
    });
    return queryString;
});

</script>

<template>
    <h1>Search</h1>
    <form id="advancedSearchForm">
        <div id="searchInputs">
            <div id="conditionInputs">
                <h3>Serial Number</h3>
                <div class="inputLine">
                    <input v-model="serialNumInput" form="advancedSearchForm" />
                    <select v-model="serialNumRelation" form="advancedSearchForm">
                        <option disabled value=""></option>
                        <option v-for="relation in numericRelations" :value="relation">
                            {{ relation }}
                        </option>
                    </select>
                    <!-- <select v-model="serialNumOperator" form="advancedSearchForm">
                        <option disabled value=""></option>
                        <option v-for="operator in setOperators" :value="operator">
                            {{ operator }}
                        </option>
                    </select> -->
                    <button @click="add" id="serial_num" form="advancedSearchForm" :disabled="!conditionExpected">Add</button>
                </div>
                <h3>Frequency</h3>
                <div class="inputLine">
                    <input v-model="frequencyInput" form="advancedSearchForm" />
                    <select v-model="frequencyRelation" form="advancedSearchForm">
                        <option disabled value=""></option>
                        <option v-for="relation in numericRelations" :value="relation">
                            {{ relation }}
                        </option>
                    </select>
                    <!-- <select v-model="frequencyOperator" form="advancedSearchForm">
                        <option disabled value=""></option>
                        <option v-for="operator in setOperators" :value="operator">
                            {{ operator }}
                        </option>
                    </select> -->
                    <button @click="add" id="frequency" form="advancedSearchForm" :disabled="!conditionExpected">Add</button>
                </div>
                <h3>Bureau</h3>
                <div class="inputLine">
                    <select v-model="bureauSelection" form="advancedSearchForm">
                        <option disabled value="">Please select one</option>
                        <option v-for="bureau in bureaus" :value="bureau">
                            {{ bureau }}
                        </option>
                    </select>
                    <!-- <select v-model="bureauOperator" form="advancedSearchForm">
                        <option disabled value=""></option>
                        <option v-for="operator in setOperators" :value="operator">
                            {{ operator }}
                        </option>
                    </select> -->
                    <button @click="add" id="bureau" form="advancedSearchForm" :disabled="!conditionExpected">Add</button>
                </div>
                <h3 id="resultsColumns">Result Columns</h3>
                <div class="columns">
                    <template v-for="column in allColumns">
                        <div class="inputLine">
                            <input type="checkbox" :id="column" :value="column" v-model="resultsColumns" form="advancedSearchForm">
                            <label :for="column">{{ headerMap(column) }}</label>
                        </div>
                    </template>
                </div>
            </div>
            <div class="divider" />
            <div id="setOperators">
                <h3>Set Operator</h3>
                <div class="inputLine">
                    <select v-model="setOperator" form="advancedSearchForm" >
                        <option v-for="operator in setOperators" :value="operator">
                            {{ operator }}
                        </option>
                    </select>
                    <button @click="add" id="setOperator" form="advancedSearchForm">Add</button>
                </div>
            </div>
            <div class="divider" />
            <div id="queryString">
                <h3>Query</h3>
                {{ queryString }}
            </div>
        </div>
    </form>
</template>

<style scoped>
#searchInputs {
    display: flex;
    flex-direction: row;
}

.inputLine {
    display: flex;
    flex-direction: row;
}

.columns {
    display: flex;
    flex-direction: column;
}

.divider {
    width: var(--section-gap);
}

#conditionInputs {
    display: flex;
    flex-direction: column;
}

#resultsColumns {
    margin-top: 15px;
}

#setOperators {
    display: flex;
    flex-direction: column;
}

input, select, button {
    background-color: var(--color-background-soft);
    border: 1px solid var(--color-border);
    color: var(--color-text);
    padding: 2px 5px;
    border-radius: 4px;
}

label {
    padding: 2px 5px;
}
</style>