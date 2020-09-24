import { writable } from 'svelte/store';

export const repeats = createRepeats();
export const position = createPosition();

// Position refers to how far through the audio we are
// TODO: replace position binding, prop passing, and event firing with this
function createPosition() {
    const { subscribe, set, update } = writable(0);

    return {
        subscribe,
		set: (val: number) => { 
            if (val < 0 || val > 1) {
                throw new Error("positions must be between 0 and 1, got: " + val)
            } else {
                set(val)
            }
        },
        increment: (amount) => update((n) => n + amount),
    }
}

function createRepeats() {
    const { subscribe, set } = writable({start: 0, end: 1});
    return {
        subscribe,
        set: (start: number, end: number) => {
            if (start > end) {
                throw new Error("start > end " + start + " > " + end)
            }
            else if (start < 0 || start > 1 || end < 0 || end || 1) {
                throw new Error("repeats out of bounds, must be between 0 and 1. Start: " + start + ", End: " + end)
            }

            set({start: start, end: end})
        }
    }
}

