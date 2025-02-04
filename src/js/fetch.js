import { ref, watchEffect, toValue } from 'vue';

export function useFetch(url) {
    const data = ref(null);
    const error = ref(null);

    watchEffect(() => {
        data.value = null;
        error.value = null;

        fetch(toValue(url), {credentials: 'include'})
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
            })
            .then((json) => (data.value = json))
            .catch((err) => (error.value = err))
    });
    return {data, error};
};