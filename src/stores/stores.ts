import { writable } from 'svelte/store';
import type { Player, VirtualInstrument } from '../lib/track/instrument'
import { NewNote } from '../lib/music/theory/notes';
import { TimedNote, TimedNotes } from '../lib/music/timed/timed';
import { midiTrack, audioTrack } from "./track";

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
export const speedStore = createSpeed();
export const waitMode = createWaitMode();

// Position refers to how far through the audio we are
// TODO: replace position binding, prop passing, and event firing with this
let x = 0
function createPosition() {
    const { subscribe, set } = writable(0);

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

function createSpeed() {
    const { subscribe, set } = writable(0);

    return {
        subscribe,
		set: (val: number) => {
            playingStore.pause()
            if (val < 0 || val > 1) {
                throw new Error("speeds must be between 0 and 1, got: " + val)
            } else {
                set(val)
            }
        },
    }
}

function createWaitMode() {
    const { subscribe, set } = writable(false);

    return {
        subscribe,
		set: (val: boolean) => {
            if (val) {
                tracks.muteAll()
                playingStore.pause()
            } else {
                tracks.unmuteAll()
            }
            set(val)
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

const frameRate = 40;
export const frameLength = 1000 / frameRate // length of a frame in milliseconds
let slto;
function createSeek() {
    const { subscribe, set } = writable(0);

    return {
        subscribe,
        set: (val: number) => {
            setPosition(val)
            set(val)
        },
        setSlow: (val: number) => {
           let diff;
           position.subscribe((pos)=>{
               diff = val - pos
           })
           let durr;
            songDuration.subscribe((d) => {
                durr = d
            })

           playingStore.play(true)
           clearTimeout(slto)
           slto = setTimeout(()=> {
               playingStore.pause()
               set(val)
            }, diff * durr)
        }
    }
}

// TODO: does this work in the function's scope too? That would be better and more encapsulated
let playInterval;
function createPlay() {
    const { subscribe, set } = writable(false);
    
    return {
        subscribe,
        play: (inwait: boolean = false) => {
            if (!inwait) {
                waitMode.set(false)
            }

            let alreadyPlaying;
            subscribe((val) => {
                alreadyPlaying = val
            })

            let ready;
            audioReady.subscribe((val) => {
                ready = val.ready
            })
            if (ready && !alreadyPlaying) {
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

                let speed;
                speedStore.subscribe((val) => {
                    speed = val;
                })
                
                playInterval = setInterval(()=>{
                    let timeNow = Date.now()
                    let newPosition = pos + ((timeNow - timeAtPlayStart)/duration) * speed
                    if (newPosition < 1) {
                        setPosition(newPosition)
                        timeAtPlayStart = timeNow // have to update this as pos will vary as it's set
                    } else {
                        // Pause at the end
                        set(false)
                        clearInterval(playInterval)
                        setPosition(1)
                    }
                }, frameLength)
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
    const { subscribe, update } = writable(new Array<midiTrack>());
    return {
        subscribe,
        newPlaybackTrack: (notes: Array<TimedNote>, playbackInstrument: VirtualInstrument) => {
            let t = new midiTrack(notes, playbackInstrument)
            t.link()
            update((currentPlayers: Array<midiTrack>) => {
                currentPlayers.push(t)
                return currentPlayers
            })
            return t.interface()
        },
        clearAll: () => {
            update((currentPlayers: Array<midiTrack>) => {
                currentPlayers.forEach((track) => {
                    track.unlink()
                })
                return []
            })
        },
        muteAll: () => {
            subscribe((currentPlayers: Array<midiTrack>) => {
                currentPlayers.forEach((track) => {
                    track.playbackInstrument.setVolume(0)
                })
            })
        },
        unmuteAll: () => {
            subscribe((currentPlayers: Array<midiTrack>) => {
                currentPlayers.forEach((track) => {
                    track.playbackInstrument.setVolume(1)
                })
            })
        }
    }
}