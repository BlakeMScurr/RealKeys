import { writable } from 'svelte/store';
import { play } from '../components/audioplayer/external/spotify';
import { NewNote } from '../lib/music/theory/notes';
import { TimedNote, TimedNotes } from '../lib/music/timed/timed';

// Position set is only accessible via seek and play
const { subscribe, set } = createPosition();
const setPosition = set
export const position = { subscribe }

export const seek = createSeek();
export const currentSong = createCurrentSong();
export const repeats = createRepeats();
export const playingStore = createPlay();
export const songDuration = createSongDuration();

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
            else if (start < 0 || start > 1 || end < 0 || end > 1) {
                throw new Error("repeats out of bounds, must be between 0 and 1. Start: " + start + ", End: " + end)
            }

            set({start: start, end: end})
        }
    }
}

function createCurrentSong() {
    const { subscribe, set } = writable(new TimedNotes([new TimedNote(0, 1, NewNote("C#", 4))]));

    return {
        subscribe,
        set: (notes: TimedNotes)=>{
            set(notes)
        }
        // TODO: does this work instead?
        // set,
    }
}

function createSongDuration() {
    const { subscribe, set } = writable(1);

    return {
        subscribe,
        set,
    }
}

function createSeek() {
    const { subscribe, set } = writable(0);

    return {
        subscribe,
        set: (val: number) => {
            setPosition(val)
            set(val)
        }
    }
}

// TODO: does this work in the function's scope too? That would be better and more encapsulated
let playInterval;
const frameRate = 40;
function createPlay() {
    const { subscribe, set } = writable(false);
    
    return {
        subscribe,
        play: () => {
            set(true)

            let timeAtPlayStart = Date.now()
            let pos;
            position.subscribe((val) => {
                pos = val
            });
            let duration;
            songDuration.subscribe((val) => {
                duration = val
            })
            
            playInterval = setInterval(()=>{
                let timeNow = Date.now()
                let newPosition = pos + (timeNow - timeAtPlayStart)/(duration * 1000)
                if (newPosition < 1) {
                    setPosition(newPosition)
                    timeAtPlayStart = timeNow // have to update this as pos will vary as it's set
                } else {
                    // Pause at the end
                    set(false)
                    clearInterval(playInterval)
                    setPosition(1)
                }
                console.log("updating")
            }, 1000 / frameRate)
        },
        pause: () => {
            set(false)
            clearInterval(playInterval)
        }
    }
}