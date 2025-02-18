<script setup>
import { headerMap } from '@/js/utils';

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

function validateInput() {

};

function validateFrequencyInput() {

};

function validateDateInput() {

};
</script>

<template>
    <div id="root">
        <h3>{{ headerMap(props.field) }}</h3>
        <template v-if="values.type === 'numeric'">
            <select v-model="values.relation">
                <option disabled value=""></option>
                <option v-for="relation in numericRelations" :value="relation">
                    {{ relation }}
                </option>
            </select>
            <input v-model="values.lowerValue" v-show="values.relation === 'between'"/>
            <p class="inputSeperator" v-show="values.relation === 'between'">and</p>
            <input v-model="values.value" />
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
        <button @click="$emit('add', props.field)" :disabled="values.relation === '' || values.value === '' || (values.relation === 'between' && values.lowerValue === '')">Add</button>
    </div>
</template>

<style scoped>

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
}

button:disabled, button[disabled] {
    color: var(--color-text-inactive);
    cursor: default;
}
</style>