<script setup>
import { headerMap, validateDateString, validateFrequencyString } from '@/js/utils';

const props = defineProps({
    field: {
        type: String,
        required: true,
    },
    options: {
        type: Array,
        required: false,
    },
});
defineEmits(['add'])
const values = defineModel();
const numericRelations = ['=', '>=', '>', '<=', '<', '!=', 'between'];

function getPlaceholder(field) {
    switch (field) {
        case 'serial_num':
            return 'e.g. C   123456, 1234';
        case 'center_frequency':
            return 'e.g. 20 MHz, 7g, 200';
        case 'review_date':
        case 'expiration_date':
        case 'revision_date':
            return 'YYYYMMDD';
        default:
            return '';
    }
};

function validateInput(field, values) {
    if (values.relation === '' || values.value === '' || (values.relation === 'between' && values.lowerValue === ''))
        return false;
    else if (field === 'center_frequency' && !validateFrequencyInput(values)) {
        return false;
    } else if (field.substr(field.length-4) === 'date' && !validateDateInput(values)) {
        return false;
    } else
        return true;
};

function formatRelation(relation) {return relation === '!=' ? 'not' : relation;};

function validateFrequencyInput(values) {
    if (!validateFrequencyString(values.value))
        return false;
    else if (values.relation === 'between' && !validateFrequencyString(values.lowerValue))
        return false;
    else
        return true;
};

function validateDateInput(values) {
    if (!validateDateString(values.value))
        return false;
    else if (values.relation === 'between' && !validateDateString(values.lowerValue))
        return false;
    else
        return true;
};
</script>

<template>
    <div id="root">
        <h3>{{ headerMap(props.field) }}</h3>
        <template v-if="values.type === 'numeric'">
            <select v-model="values.relation">
                <option disabled value=""></option>
                <option v-for="relation in numericRelations" :value="relation">
                    {{ formatRelation(relation) }}
                </option>
            </select>
            <input v-model="values.lowerValue" v-show="values.relation === 'between'" :placeholder="getPlaceholder(props.field)"/>
            <p class="inputSeparator" v-show="values.relation === 'between'">and</p>
            <input v-model="values.value" :placeholder="getPlaceholder(props.field)"/>
        </template>
        <template v-else-if="values.type === 'categoric'">
            <select v-model="values.value">
                <option disabled value=""></option>
                <option v-for="option in props.options" :value="option">
                    {{ option }}
                </option>
            </select>
        </template>
        <template v-else-if="values.type === 'text'">
            <textarea v-model="values.value"></textarea>
        </template>
        <button @click="$emit('add', props.field)" :disabled="!validateInput(props.field, values)">Add</button>
        <span v-if="props.field === 'bureau'"><a href="https://www.ntia.gov/sites/default/files/2023-11/g_2021_edition_rev_2023.pdf" target="_blank">Annex G Section G.1</a></span>
        <span v-if="['tx_state_country_code', 'rx_state_country_code'].includes(props.field)"><a href="https://www.ntia.gov/sites/default/files/2023-11/g_2021_edition_rev_2023.pdf#page=11" target="_blank">Annex G Section G.2</a></span>
        <span v-if="props.field === 'station_class'"><a href="https://www.ntia.gov/sites/default/files/2023-11/6_2021_edition_rev_2023.pdf#page=15" target="_blank">Chapter 6 Section 6.1.2</a></span>
    </div>
</template>

<style scoped>

.inputSeparator {
    margin: 0 8px;
}

#root {
    display: flex;
    flex-direction: row;
    margin-bottom: 20px;
}

h3 {
    padding-right: 5px;
}

select, button {
    cursor: pointer;
    font-family: inherit;
}

input, select, button, textarea {
    background-color: var(--color-background-soft);
    border: 1px solid var(--color-border);
    color: var(--color-text);
    border-radius: 4px;
}

label, input, select, button {
    padding: 2px 5px;
    font-size: 18px;
}

button:disabled, button[disabled] {
    color: var(--color-text-inactive);
    cursor: default;
}

span {
    margin-left: 8px;
    align-self: center;
}

a:link {
    color: var(--color-link);
}

a:visited {
    color: var(--color-link-visited);
}
</style>