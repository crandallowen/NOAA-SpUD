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
        const request = new Request(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({username, password})
        });
        const name = await fetch(request)
        .then((response) => response.text().then((text) => {
            if (!response.ok) {
                if([401, 403].includes(response.status) && user.value) {
                    logout();
                }
                return Promise.reject(response.statusText);
            }
            const data = text && JSON.parse(text);
            return data;
        }))
        .catch((error) => {
            console.error(error);
            alert('Authentication failed');
        });
        user.value = name;
        localStorage.setItem('user', JSON.stringify({user: user.value}));
        router.push(returnURL.value || '/');
    };

    function logout() {
        user.value = null;
        localStorage.removeItem('user');
        router.push('/login');
    };

    return { user, returnURL, login, logout };
});