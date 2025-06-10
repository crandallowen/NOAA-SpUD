import { toValue } from 'vue';
import router from '@/router';
import { useAuthStore } from '@/stores/auth';

function handleError(error) {
    switch(error.message) {
        case 'Forbidden':
            router.push('/notAuthorized');
            break;
        case 'Unauthorized':
            useAuthStore().logout();
            break;
        default:
            console.error(`${error.name}: ${error.message}`);
    }
};

export async function useFetch(url, options={method: 'GET', credentials: 'include'}) {
    if (!options.hasOwnProperty('credentials'))
        options.credentials = 'include';
    return fetch(toValue(url), options)
        .then((response) => {
            if (!response.ok) {
                switch (response.status) {
                    case 401:
                        throw new Error('Unauthorized');
                    case 403:
                        throw new Error('Forbidden');
                    case 500:
                        throw new Error('Internal Server Error');
                    default:
                        throw new Error('Unhandled response status');
                }
            }
            return response.json();
        })
        .catch((error) => handleError(error));
};