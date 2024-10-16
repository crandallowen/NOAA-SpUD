import { defineStore } from 'pinia';
import { ref } from 'vue';
import router from '@/router';

export const useAuthStore = defineStore('auth', () => {
    const user = ref('');
    const returnURL = ref(null);

    if (localStorage.getItem('user')) {
        let state = JSON.parse(localStorage.getItem('user'));
        user.value = state.user;
    }

    async function login(username, password) {
        let url = new URL(`${window.location.origin}/login`);
        const user = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({username, password})
        })
        .then((response) => response.text())
        .then((text) => {
            const data = text && JSON.parse(text);
            if (!response.ok) {
                if([401, 403].includes(response.status) && user.value) {
                    logout();
                }
                const error = (data && data.message) || response.statusText;
                return Promise.reject(error);
            }
            return data;
        });
        user.value = user;
        localStorage.setItem('user', JSON.stringify(user));
        router.push(returnURL.value || '/');
    };

    function logout() {
        user.value = null;
        localStorage.removeItem('user');
        router.push('/login');
    };

    return { user, redirectURL, login, logout };
});