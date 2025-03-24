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
    if (localStorage.getItem('auth')) {
        let state = JSON.parse(localStorage.getItem('auth'));
        returnURL.value = state.returnURL;
    }

    // async function login(username, password) {
    //     let url = new URL(`${window.location.origin}/login`);    
    //     const request = new Request(url, {
    //         method: 'POST',
    //         headers: {
    //             'Content-Type': 'application/json'
    //         },
    //         body: JSON.stringify({username, password})
    //     });
    //     const name = await fetch(request)
    //     .then((response) => response.text().then((text) => {
    //         if (!response.ok) {
    //             if([401, 403].includes(response.status) && user.value) {
    //                 logout();
    //             }
    //             return Promise.reject(response.statusText);
    //         }
    //         const data = text && JSON.parse(text);
    //         return data;
    //     }))
    //     .catch((error) => {
    //         console.error(error);
    //         alert('Authentication failed');
    //     });
    //     user.value = name;
    //     localStorage.setItem('user', JSON.stringify({user: user.value}));
    //     router.push(returnURL.value || '/');
    //     localStorage.removeItem('auth');
    // };
    function login() {
        // Production Login Func
        // const url = new URL(`${window.location.origin}/checkAuth`);
        // const request = new Request(url, {method: 'GET'});
        // fetch(request)
        //     .then((response) => {
        //         if (response.status === 200) {
        //             return response.json()
        //         } else {
        //             console.log(`Non-200 Auth Response: ${response}`)
        //             location = '/login';
        //         }
        //     })
        //     .then((json) => {
        //         const data = JSON.parse(json);
        //         console.log(`Response Data: ${data}`);
        //         return data;
        //     })
        //     .then((data) => {
        //         user.value = data.user;
        //         localStorage.setItem('user', JSON.stringify({user: user.value}));
        //         router.push(returnURL.value || '/');
        //         localStorage.removeItem('auth');
        //     })
        //     .catch((error) => {
        //         console.error(`${error.name}: ${error.message}`);
        //     })


        let url = new URL(`${window.location.origin}/login`);    
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
                localStorage.setItem('user', JSON.stringify({user: user.value}));
                router.push(returnURL.value || '/');
                localStorage.removeItem('auth');
            })
            .catch((error) => {
                console.error(`${error.name}: ${error.message}`);
                alert('Authentication failed');
            });
        
        // let url = new URL(`${window.location.origin}/login`);    
        // const request = new Request(url, {
        //     method: 'GET',
        //     redirect: 'follow',
        // });
        // fetch(request)
        //     .then((response) => {
        //         // if (!response.ok) {
        //         //     if([401, 403].includes(response.status) && user.value) {
        //         //         logout();
        //         //     }
        //         //     return Promise.reject(response.statusText);
        //         // }
        //         console.log(response.url)
        //         response.headers.forEach(console.log)
        //         // return response.json()
        //     })
        //     .then((json) => {
        //         console.log(json);
        //         const data = json && JSON.parse(json);
        //         console.log(data)
        //         return data;
        //     })
        //     .catch((error) => {
        //         console.error(`${error.name}: ${error.message}`);
        //         alert('Authentication failed');
        //         // return error;
        //     })
        // user.value = data;
        // localStorage.setItem('user', JSON.stringify({user: user.value}));
        // router.push(returnURL.value || '/');
        // localStorage.removeItem('auth');
    };

    function loginCallback() {
        // const url = new URL(`${window.location.origin}/login/callback`);    
        // const request = new Request(url, {
        //     method: 'POST',
        //     credentials: true,
        // });
        // fetch(url, request)
        //     .then((user) => {
        //         console.log(user);
        //     })
        //     .catch((error) => {
        //         console.error(error);
        //     })
        
    };

    function logout() {
        user.value = null;
        localStorage.removeItem('user');
        returnURL.value = router.currentRoute.value.fullPath;
        localStorage.setItem('auth', JSON.stringify({returnURL: returnURL.value}));
        router.push('/login');
    };

    return { user, returnURL, login, loginCallback, logout };
});