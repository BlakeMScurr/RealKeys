import { writable } from 'svelte/store';
import type { VirtualInstrument } from '../lib/track/instrument'
import { NewNote } from '../lib/music/theory/notes';
import { TimedNote, TimedNotes } from '../lib/music/timed/timed';
import { get } from '../lib/util'
import { midiTrack } from "./track";

// TODO: refactor to eliminate all the store boilerplate
// TODO: consider using a state machine, as it will have stricter guarantees about the possible states the game can be in
export class GameMaster {
    private setPosition: any;
    position: any;
    seek: any;
    currentSong: any;
    repeats: any;
    playingStore: any;
    songDuration: any;
    audioReady: any;
    tracks: any;
    speedStore: any;
    waitMode: any;
    constructor() {
        // TODO: make all of these classes so we have well defined types
        const { subscribe, set } = createPosition();
        this.setPosition = set
        this.position = { subscribe }
        this.currentSong = createCurrentSong();
        this.repeats = createRepeats();
        this.playingStore = createPlay();
        this.songDuration = createSongDuration();
        this.audioReady = createAudioReady();
        this.speedStore = createSpeed(this.playingStore);
        this.seek = createSeek(this.setPosition, this.playingStore, this.position, this.songDuration, this.speedStore);
        this.tracks = createTracks(this.playingStore);
        this.waitMode = createWaitMode(this.tracks, this.playingStore);

        // Resolve cyclic store dependencies
        // TODO: simplify
        this.playingStore.setStores(this.waitMode, this.audioReady, this.position, this.songDuration, this.speedStore, this.setPosition)
        this.tracks.setWaitModeStore(this.waitMode)
    }
}

// stores that don't depend on others

// Position refers to how far through the audio we are
// TODO: replace position binding, prop passing, and event firing with this
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

// stores that depend on others

function createSeek(setPosition, playingStore, position, songDuration, speed) {
    let slto;
    const { subscribe, set } = writable(0);

    return {
        subscribe,
        set: (val: number) => {
            setPosition(val)
            set(val)
        },
        setSlow: (val: number) => {
           playingStore.play(true)
           clearTimeout(slto)
           slto = setTimeout(()=> {
               playingStore.pause()
               set(val)
            }, (val - get(position)) * get(songDuration) * (1/get(speed)))
        }
    }
}

function createPlay() {
    // TODO: does this work in the function's scope too? That would be better and more encapsulated
    let playInterval;
    const frameRate = 40;
    const frameLength = 1000 / frameRate // length of a frame in milliseconds
    const { subscribe, set } = writable(false);
    
    // TODO: add types
    let waitMode;
    let audioReady;
    let position;
    let songDuration;
    let speedStore;
    let setPosition;
    
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

            if (get(audioReady).ready && !alreadyPlaying) {
                set(true)
                let timeAtPlayStart = Date.now()
                
                playInterval = setInterval(()=>{
                    let timeNow = Date.now()
                    let newPosition = get(position) + ((timeNow - timeAtPlayStart)/get(songDuration)) * get(speedStore)
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
        },
        // This enables cyclic store dependencies
        // TODO: eliminate this hack
        setStores: (waitModeArg, audioReadyArg, positionArg, songDurationArg, speedStoreArg, setPositionArg) => {
            waitMode = waitModeArg
            audioReady = audioReadyArg
            position = positionArg
            songDuration = songDurationArg
            speedStore = speedStoreArg
            setPosition = setPositionArg
        }
    }
}

function createWaitMode(tracks, playingStore) {
    const { subscribe, set } = writable(false);
    let lastTrackSet: string[];

    return {
        subscribe,
		set: (val: boolean) => {
            if (val) {
                lastTrackSet = tracks.enabled()
                tracks.enable([])
                playingStore.pause()
            } else {
                subscribe((previousWaitValue) => {
                    if (!previousWaitValue && lastTrackSet !== undefined) {
                        tracks.enable(lastTrackSet)
                    }
                })
            }
            set(val)
        },
        setLastTrackSet: (trackSet: string[]) => {
            lastTrackSet = trackSet
        }
    }
}

function createTracks(playingStore) {
    const { subscribe, update } = writable(new Map<string, midiTrack>());
    // TODO: add types
    let waitMode: any;
    return {
        subscribe,
        newPlaybackTrack: (name: string, notes: TimedNotes, playbackInstrument: VirtualInstrument, gm: GameMaster) => {
            let t = new midiTrack(notes, playbackInstrument, gm)
            t.link()
            update((currentPlayers: Map<string, midiTrack>) => {
                if (currentPlayers.has(name)) {
                    throw new Error(`Track ${name} already exists`)
                }
                currentPlayers.set(name, t)
                return currentPlayers
            })
        },
        clearAll: () => {
            update((currentPlayers: Map<string, midiTrack>) => {
                currentPlayers.forEach((track) => {
                    track.unlink()
                })
                return new Map<string, midiTrack>();
            })
        },
        enable: (trackNames: string[]) => {
            if (get(waitMode)) {
                waitMode.setLastTrackSet(trackNames)
            } else {
                subscribe((currentPlayers: Map<string, midiTrack>) => {
                    let wasPlaying = get(playingStore)
                    playingStore.pause()
                    currentPlayers.forEach((track, name) => {
                        if (trackNames.indexOf(name) !== -1) {
                            track.relink()
                        } else {
                            track.unlink()
                        }
                    })
                    if (wasPlaying) {
                        playingStore.play()
                    }
                })
            }
        },
        enabled: () => {
            // TODO: refactor so we just have a currentlyEnabled variable to read
            let currentlyEnabled = new Array<string>();
            subscribe((currentPlayers: Map<string, midiTrack>) => {
                currentPlayers.forEach((track, name) => {
                    if (track.islinked()) {
                        currentlyEnabled.push(name)
                    }
                })
            })()
            return currentlyEnabled
        },
        notes: (trackNames: string[]):Map<string, TimedNotes> => {
            let noteMap = new Map<string, TimedNotes>();
            subscribe((currentPlayers: Map<string, midiTrack>) => {
                trackNames.forEach((name) => {
                    if (!currentPlayers.has(name)) {
                        throw new Error(`There is no track called ${name}. Current tracks are ${Array.from(currentPlayers.keys())}`)
                    }
                    noteMap.set(name, currentPlayers.get(name).notes)
                })
            })()
            return noteMap
        },
        subscribeToNotesOfTracks: (tracks: string[], onStateChange: (notes: Map<string, string>) => void) => {
            if (tracks.length != 1) {
                throw new Error(`TODO: implement subscription to ${tracks.length} tracks`)
            }

            let unsubscriber
            subscribe((currentPlayers: Map<string, midiTrack>) => {
                if (!currentPlayers.has(tracks[0])) {
                    throw new Error(`player has no track ${tracks[0]}`)
                }

                unsubscriber = currentPlayers.get(tracks[0]).interface().subscribeToNotes(onStateChange)
            })()

            return unsubscriber
        },
        setWaitModeStore: (wms) => {
            waitMode = wms
        },
    }
}

function createSpeed(playingStore) {
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