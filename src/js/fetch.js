import { toValue } from 'vue';

export async function useFetch(url) {
    return fetch(toValue(url), {credentials: 'include'})
        .then((response) => {
            if ([401, 403].includes(response.status)) {
                switch (response.status) {
                    case 401:
                        throw new Error('Unauthorized');
                    case 403:
                        throw new Error('Forbidden');
                    default:
                        throw new Error('Unhandled response status');
                }
            }
            return response.json();
        });
};