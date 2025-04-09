import { defineStore } from 'pinia';
import { ref } from 'vue';
import router from '@/router';

const IS_DEV = process.env.NODE_ENV.trim() === 'development';

export const useAuthStore = defineStore('auth', () => {
    const user = ref('');
    const returnURL = ref(null);

    if (sessionStorage.getItem('auth')) {
        let state = JSON.parse(sessionStorage.getItem('auth'));
        user.value = state.user;
    };

    function login() {
        if (IS_DEV) {
            // Development Login Function
            const url = new URL(`${window.location.origin}/login`);    
            const request = new Request(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({username: 'owen', password: 'owen'})
            });
            fetch(request)
                .then((response) => {
                    if (!response.ok) {
                        if([401, 403].includes(response.status) && user.value) {
                            logout();
                        }
                        return Promise.reject(response.statusText);
                    }
                    return response.json()
                })
                .then((data) => {
                    user.value = data.user.username;
                    sessionStorage.setItem('auth', JSON.stringify({user: user.value}));
                    router.push(returnURL.value || '/');
                })
                .catch((error) => {
                    console.error(`${error.name}: ${error.message}`);
                    alert('Authentication failed');
                });
        } else {
            // Production Login Func
            const url = new URL(`${window.location.origin}/checkAuth`);
            const request = new Request(url, {credentials: 'include', method: 'GET'});
            fetch(request)
                .then((response) => {
                    if ([200, 403].includes(response.status)) {
                        return response.json();
                    } else {
                        console.log(`Non-200 Auth Response Status: ${response.status}`);
                        location = '/login';
                    }
                })
                .then((data) => {
                    if (data.status === 200) {
                        user.value = data.user;
                        sessionStorage.setItem('auth', JSON.stringify({user: user.value}));
                        router.push(returnURL.value || '/');
                    } else {
                        console.log(`Unauthorized user: ${data.user.id}`);
                        router.push('notAuthorized');
                    }
                })
                .catch((error) => {
                    console.error(`${error.name}: ${error.message}`);
                })
        }
    };

    function logout() {
        user.value = null;
        sessionStorage.removeItem('auth');
        router.push('/login');
    };

    return { user, returnURL, login, logout };
});