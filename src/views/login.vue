<script setup>
import { useAuthStore } from '@/stores/auth';
import { reactive } from 'vue';

const input = reactive({
    username: "",
    password: ""
});

function onSubmit() {
    const auth = useAuthStore();
    const { username, password } = values;
    return auth.login(username, password)
        .catch((error) => console.error(error));
};
</script>

<template>
    <div>
        <h2>Login</h2>
        <form name="login-form">
            <div>
                <label for="username">Username: </label>
                <input id="username" type="text" v-model="input.username" :disabled="input.username === ''"/>
            </div>
            <div>
                <label for="password">Password: </label>
                <input id="password" type="password" v-model="input.password" :disabled="input.password === ''"/>
            </div>
            <button type="submit" @click.prevent="onSubmit()">Login</button>
        </form>
    </div>
</template>