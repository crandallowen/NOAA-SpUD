import { defineStore } from 'pinia';
import { ref } from 'vue';
import router from '@/router';

export const useAuthStore = defineStore('auth', () => {
    const user = ref('');
    const returnURL = ref(null);

    if (sessionStorage.getItem('auth')) {
        let state = JSON.parse(sessionStorage.getItem('auth'));
        user.value = state.user;
    };

    function login() {
        const url = new URL(`${window.location.origin}/api/checkAuth`);
        const request = new Request(url, {credentials: 'include', method: 'GET'});
        fetch(request)
            .then((response) => {
                if ([200, 403].includes(response.status)) {
                    return response.json();
                } else {
                    location = '/login';
                }
            })
            .then((data) => {
                if (data.status === 200) {
                    user.value = data.user;
                    user.value.canUpload = data.uploadAuthorized;
                    sessionStorage.setItem('auth', JSON.stringify({user: user.value}));
                    router.push(returnURL.value || '/');
                } else {
                    router.push('notAuthorized');
                }
            })
            .catch((error) => {
                console.error(`${error.name}: ${error.message}`);
            })
    };

    function logout() {
        user.value = null;
        sessionStorage.removeItem('auth');
        router.push('/login');
    };

    return { user, returnURL, login, logout };
});