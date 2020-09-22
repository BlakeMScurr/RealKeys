import { writable } from 'svelte/store';

// Position refers to how far through the audio we are
// TODO: replace position binding, prop passing, and event firing with this
function createPosition() {
    const { subscribe, set } = writable(0);

    return {
        subscribe,
		set: () => (val: number) => { 
            if (val < 0 || val > 1) {
                throw new Error("positions must be between 0 and 1, got: " + val)
            } else {
                set(val)
            }
        }
    }
}

export const position = createPosition();