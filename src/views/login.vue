<script setup>
import { useAuthStore } from '@/stores/auth';
import { reactive } from 'vue';

const auth = useAuthStore();
const input = reactive({
    username: "",
    password: ""
});

async function onSubmit() {
    const { username, password } = input;
    try {
        // return await auth.login(username, password);
        return auth.login();
    } catch (error) {
        return console.error(error);
    }
};
auth.login()
</script>

<template>
    <!-- <div>
        <h2>Login</h2>
        <form name="login-form">
            <div>
                <label for="username">Username: </label>
                <input id="username" type="text" v-model="input.username"/>
            </div>
            <div>
                <label for="password">Password: </label>
                <input id="password" type="password" v-model="input.password"/>
            </div>
            <button type="submit" @click.prevent="onSubmit()" :disabled="input.password === '' || input.username === ''">Login</button>
        </form>
    </div> -->
</template>