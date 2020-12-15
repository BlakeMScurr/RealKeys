import type { instrument } from './instruments';
import { writable } from 'svelte/store';
import type { Player } from '../components/audioplayer/audioplayer'
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
                playingStore.pause()
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
function createSeek() {
    const { subscribe, set } = writable(0);

    return {
        subscribe,
        set: (val: number) => {
            setPosition(val)
            set(val)
        },
        setSlow: (val: number) => {
           let tmppos; // need tmp pos so pos doesn't keep being recalculated
           position.subscribe((p)=>{
               tmppos = p
           })
           let pos = tmppos

           let duration
           songDuration.subscribe((d)=>{
               duration = d
           })

           let speed
           speedStore.subscribe((s) => {
               speed = s
           })

           let to
           let diff = val - pos
           let currDiff = 0
           to = setInterval(() => {
               currDiff += frameLength / duration
               setPosition(pos + currDiff)
               if (currDiff >= diff) {
                   clearInterval(to)
                   setPosition(val)
                   set(val)
               }
           }, frameLength * speed);
        }
    }
}

// TODO: does this work in the function's scope too? That would be better and more encapsulated
let playInterval;
function createPlay() {
    const { subscribe, set } = writable(false);
    
    return {
        subscribe,
        play: () => {
            waitMode.set(false)
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
    const { subscribe, update } = writable(new Array<audioTrack>());

    return {
        subscribe,
        new: (player: Player) => {
            if (!mainTrackSet) {
                update((currentPlayers: Array<audioTrack>) => {
                    let t = new audioTrack(player)
                    t.link()
                    currentPlayers.push(t)
                    return currentPlayers
                })
                mainTrackSet = true
            } else {
                console.warn("main track already set") // the main track is generally a spotify track, or something to play along to, hence only allowing one
            }
        },
        newPlaybackTrack: (notes: Array<TimedNote>, playbackInstrument: instrument) => {
            let t = new midiTrack(notes, playbackInstrument)
            t.link()
            update((currentPlayers: Array<audioTrack>) => {
                currentPlayers.push(t)
                return currentPlayers
            })
            return t.interface()
        },
        clearAll: () => {
            update((currentPlayers: Array<audioTrack>) => {
                currentPlayers.forEach((track) => {
                    track.unlink()
                })
                return []
            })
        }
    }
}