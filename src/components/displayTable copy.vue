<script setup>
import { ref, reactive } from 'vue'
import { request, headerMap } from '@/js/utils';

const rows= ref([]);
const fields = ref([]);

request({method: 'GET', url: 'getBooks'})
    .then((responseJSON) => {
        let response = JSON.parse(responseJSON);
        response.rows.forEach(row => {
            rows.value.push(reactive(row));
        });
        response.fields.forEach(field => {
            fields.value.push(field.name);
        });
    })
    .catch((error) => {
        console.error(error);
    })
    .finally(() => {
        // console.log(rows);
        // console.log(fields);
    });
</script>

<template>
    <h2>Display Table</h2>
    <table class="displayTable">
        <thead>
        <tr>
            <th v-for="value in fields">
                {{ headerMap(value) }}
            </th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="row in rows">
            <td v-for="value in row">
                {{ value }}
            </td>
        </tr>
        </tbody>
    </table>
</template>