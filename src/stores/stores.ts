import type { instrument } from './instruments';
import { writable } from 'svelte/store';
import type { Player } from '../components/audioplayer/audioplayer'
import { NewNote } from '../lib/music/theory/notes';
import { TimedNote, TimedNotes } from '../lib/music/timed/timed';
import { playbackTrack, track } from "./track";

// Position set is only accessible via seek and play
const { subscribe, set } = createPosition();
const setPosition = set
export const position = { subscribe }

// TODO: consoldiate into highly testable time manager class
export const seek = createSeek();
export const currentSong = createCurrentSong();
export const repeats = createRepeats();
export const playingStore = createPlay();
export const songDuration = createSongDuration();
export const audioReady = createAudioReady();
export const tracks = createTracks();

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
    const { subscribe, set } = writable(100000);

    return {
        subscribe,
        set: (dur: Promise<number>|number) => {
            if (dur instanceof Promise) {
                dur.then((d) => {
                    set(d)
                })
            } else {
                set(dur)
            }
        }
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
            let ready;
            audioReady.subscribe((val) => {
                ready = val.ready
            })
            if (ready) {
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
                    let newPosition = pos + (timeNow - timeAtPlayStart)/(duration)
                    if (newPosition < 1) {
                        setPosition(newPosition)
                        timeAtPlayStart = timeNow // have to update this as pos will vary as it's set
                    } else {
                        // Pause at the end
                        set(false)
                        clearInterval(playInterval)
                        setPosition(1)
                    }
                }, 1000 / frameRate)
            }
        },
        pause: () => {
            set(false)
            clearInterval(playInterval)
        }
    }
}

// TODO: only expose subscribe
function createAudioReady() {
    const { subscribe, set } = writable({reason: "Loading Audio", ready: false});

    return {
        subscribe,
        notReady: (reason: string) => {
            set({reason: reason, ready: false})
        },
        ready: () => {
            set({reason: "", ready: true})
        }
    }
}


let mainTrackSet = false
function createTracks() {
    const { subscribe, update } = writable(new Array<track>());

    return {
        subscribe,
        // TODO: name better so it's clear we're only allowed one main track
        new: (player: Player) => {
            if (!mainTrackSet) {
                update((currentPlayers: Array<track>) => {
                    let t = new track(player)
                    t.link()
                    currentPlayers.push(t)
                    return currentPlayers
                })
                mainTrackSet = true
            } else {
                console.warn("main track already set")
            }
        },
        newPlaybackTrack: (notes: Array<TimedNote>, playbackInstrument: instrument) => {
            let t = new playbackTrack(notes, playbackInstrument)
            t.link()
            update((currentPlayers: Array<track>) => {
                currentPlayers.push(t)
                return currentPlayers
            })
            return (callback)=>{
                t.subscribeToNotes(callback)
            }
        }
    }
}

function createInstruments() {
    const { subscribe, update } = writable(new Array<instrument>());

    return {
        settings: () => {
            
        },
        add: (ins: instrument) => {
           update((currentInstruments: Array<instrument>) => {
               currentInstruments.push(ins)
               return currentInstruments
           })
        },
    }
}


// TODO: pause at the end

// TODO: handle repeats
// Old repeat code:
// function setRepeatIntervals(ct) {
//     // time argument is a workaround for https://github.com/goldfire/howler.js/issues/1189
//     // as we have to seek before called play() on the howler object in our play function, for whatever reason
//     if (isNaN(ct)) {
//         ct = audioPlayer.CurrentTime()
//     }
//     if (playing) {
//         clearInterval(repeatInterval)
//         clearTimeout(repeatTimeout)
//         if (ct < endRepeat * duration) {
//             repeatTimeout = setTimeout(()=>{
//                 audioPlayer.Seek(startRepeat * duration)
//                 setPosition(startRepeat)
//                 clearInterval(repeatInterval)
//                 repeatInterval = setInterval(() => {
//                     audioPlayer.Seek(startRepeat * duration)
//                     setPosition(startRepeat)
//                 }, ((endRepeat - startRepeat) * duration) * 1000);
//             }, (endRepeat * duration - ct) * 1000)
//         }
//     }
// }