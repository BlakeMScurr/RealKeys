import { writable } from 'svelte/store';

export const noteLeeway = createnoteLeeway();

function createnoteLeeway() {
    const { subscribe, set } = writable(100);
    return {
        subscribe,
		set,
    }
}