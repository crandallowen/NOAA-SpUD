<script setup>
import { headerMap } from '@/js/utils';

const field = defineModel();
const numericRelations = ['=', '>=', '>', '<=', '<', '!=', 'between'];


</script>

<template>
    <div class="root">
        <h3>{{ headerMap(field.name) }}</h3>
        <select v-model="field.relation">
            <option disabled value=""></option>
            <option v-for="relation in numericRelations" :value="relation">
                {{ relation }}
            </option>
        </select>
        <input v-model="field.lowerValue" v-show="field.relation === 'between'"/>
        <p class="inputSeperator" v-show="field.relation === 'between'">and</p>
        <input v-model="field.value" />
        <button @click="$emit('add', field.name)" :disabled="field.relation === '' || field.value === '' || (field.relation === 'between' && field.lowerValue === '')">Add</button>
    </div>
</template>

<style scoped>

.root {
    display: flex;
    flex-direction: row;
}

h3 {
    padding-right: 5px;
}

button {
    cursor: pointer;
    padding: 2px 5px;
    font-family: inherit;
}

input, select, button, textarea {
    background-color: var(--color-background-soft);
    border: 1px solid var(--color-border);
    color: var(--color-text);
    border-radius: 4px;
}

button:disabled, button[disabled] {
    color: var(--color-text-inactive);
    cursor: default;
}
</style>