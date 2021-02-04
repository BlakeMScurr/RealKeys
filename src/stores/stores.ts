import { Readable, writable } from 'svelte/store';
import type { VirtualInstrument } from '../lib/track/instrument'
import { TimedNotes } from '../lib/music/timed/timed';
import type { Note } from '../lib/music/theory/notes';
import { get } from '../lib/util'
import { midiTrack } from "./track";

// TODO: refactor to eliminate all the store boilerplate
// TODO: consider using a state machine, as it will have stricter guarantees about the possible states the game can be in
export class GameMaster {
    private setPosition: any;
    position: Readable<number>;
    seek: seek;
    play: play;
    duration: duration;
    tracks: tracks;
    speed: speed;
    waitMode: waitMode;
    constructor() {
        // TODO: make all of these classes so we have well defined types
        const { subscribe, set } = createPosition();
        this.setPosition = set
        this.position = { subscribe }
        this.play = new play();
        this.duration = new duration(set);
        this.speed = new speed(this.play);
        this.seek = new seek(this.setPosition, this.play, this.position, this.duration, this.speed);
        this.tracks = new tracks(this.play);
        this.waitMode = new waitMode(this.tracks, this.play);

        // Resolve cyclic store dependencies
        // TODO: simplify
        this.play.setStores(this.waitMode, this.position, this.duration, this.speed, this.setPosition)
        this.tracks.setWaitModeStore(this.waitMode)
    }
}

// stores that don't depend on others

// Position refers to how far through the audio we are
// TODO: make this a proper type
// TODO: replace position binding, prop passing, and event firing with this
function createPosition() {
    const { subscribe, set } = writable(0);

    return {
        subscribe,
		set: (val: number) => {
            if (val > 1) {
                throw new Error("positions must be below 1, got: " + val)
            } else {
                set(val)
            }
        },
    }
}

class duration {
    private internalSet;
    private setPosition;
    subscribe;

    constructor(setPosition) {
        const { subscribe, set } = writable(100000);
        this.subscribe = subscribe
        this.internalSet = set
        this.setPosition = setPosition
    }


    set (dur: Promise<number>|number) {
        const initialPosition = -2000
        if (dur instanceof Promise) {
            dur.then((d) => {
                this.setPosition(initialPosition/d)
                this.internalSet(d)
            })
        } else {
            this.setPosition(initialPosition/dur)
            this.internalSet(dur)
        }
    }
}

// stores that depend on others

class seek {
    private setPosition: any;
    private playingStore: any;
    private position: any;
    private duration: any;
    private speed: any;

    private internalSet;
    subscribe;

    slto: ReturnType<typeof setTimeout>;
    constructor(setPosition, playingStore, position, duration, speed) {
        this.setPosition = setPosition
        this.playingStore = playingStore
        this.position = position
        this.duration = duration
        this.speed = speed
        this.slto = null

        const { subscribe, set } = writable(0);
        this.subscribe = subscribe
        this.internalSet = set
    }

    set(val: number) {
        this.setPosition(val)
        this.internalSet(val)
    }

    setSlow (val: number) {
        this.playingStore.play(true)
        clearTimeout(this.slto)
        this.slto = setTimeout(()=> {
            this.playingStore.pause()
            this.setPosition(val)
            this.set(val)
         }, (val - get(<Readable<number>>this.position)) * get(<Readable<number>>this.duration) * (1/get(<Readable<number>>this.speed)))
     }
}

class play {
    frameLength;
    playInterval;

    private waitMode;
    private position;
    private duration;
    private speedStore;
    private setPosition;
    private set;
    subscribe;

    constructor() {
        this.frameLength = 1000 / 40 // length of a frame in milliseconds
        const { subscribe, set } = writable(false);
        this.subscribe = subscribe
        this.set = set
    }

    play(inwait: boolean = false) {
        if (!inwait) {
            this.waitMode.set(false)
        }

        let alreadyPlaying;
        this.subscribe((val) => {
            alreadyPlaying = val
        })

        if (!alreadyPlaying) {
            this.set(true)
            let timeAtPlayStart = Date.now()
            
            this.playInterval = setInterval(()=>{
                let timeNow = Date.now()
                let newPosition = get(<Readable<number>>this.position) + ((timeNow - timeAtPlayStart)/get(<Readable<number>>this.duration)) * get(<Readable<number>>this.speedStore)
                if (newPosition < 1) {
                    this.setPosition(newPosition)
                    timeAtPlayStart = timeNow // have to update this as pos will vary as it's set
                } else {
                    // Pause at the end
                    this.set(false)
                    clearInterval(this.playInterval)
                    this.setPosition(1)
                }
            }, this.frameLength)
        }
    }
    pause() {
        this.set(false)
        clearInterval(this.playInterval)
    }

    // This enables cyclic store dependencies
    // TODO: eliminate this hack
    setStores (waitModeArg, positionArg, durationArg, speedStoreArg, setPositionArg) {
        this.waitMode = waitModeArg
        this.position = positionArg
        this.duration = durationArg
        this.speedStore = speedStoreArg
        this.setPosition = setPositionArg
    }
}

// TODO: create a class for each mode following some interface, so we can easily add new modes like "By Ear" without complex interactions of existing mode.
// This is simply a class representing whether we're in wait mode
class waitMode {
    subscribe;
    private internalSet;
    private lastTrackSet: string[];
    private tracks: tracks;
    private playingStore;
    constructor(tracks: tracks, playingStore) {
        this.tracks = tracks
        this.playingStore = playingStore

        const { subscribe, set } = writable(false);
        this.subscribe = subscribe
        this.internalSet = set
    }

    set (val: boolean) {
        if (val) {
            this.lastTrackSet = this.tracks.enabled()
            this.tracks.enable([])
            this.playingStore.pause()
        } else {
            this.subscribe((previousWaitValue) => {
                if (!previousWaitValue && this.lastTrackSet !== undefined) {
                    this.tracks.enable(this.lastTrackSet)
                }
            })
        }
        this.internalSet(val)
    }

    setLastTrackSet(trackSet: string[]) {
        this.lastTrackSet = trackSet
    }

}

class tracks {
    playingStore
    subscribe
    private update
    // TODO: add type
    waitMode: any;
    constructor(playingStore) {
        this.playingStore = playingStore
        const { subscribe, update } = writable(new Map<string, midiTrack>());
        this.subscribe = subscribe
        this.update = update
    }

    // TODO: don't require a gm to be passed in, as it should only be the game master on which this tracks object is found
    // This can be done by requiring specific parts of the gm api i nthe tracks rather than the whole thing
    newPlaybackTrack (name: string, notes: TimedNotes, playbackInstrument: VirtualInstrument, gm: GameMaster) {
        let t = new midiTrack(notes, playbackInstrument, gm)
        t.link()
        this.update((currentPlayers: Map<string, midiTrack>) => {
            if (currentPlayers.has(name)) {
                throw new Error(`Track ${name} already exists`)
            }
            currentPlayers.set(name, t)
            return currentPlayers
        })
    }

    clearAll() {
        this.update((currentPlayers: Map<string, midiTrack>) => {
            currentPlayers.forEach((track) => {
                track.unlink()
            })
            return new Map<string, midiTrack>();
        })
    }

    enable(trackNames: string[]) {
        if (get(this.waitMode)) {
            this.waitMode.setLastTrackSet(trackNames)
        } else {
            this.subscribe((currentPlayers: Map<string, midiTrack>) => {
                let wasPlaying = get(this.playingStore)
                this.playingStore.pause()
                currentPlayers.forEach((track, name) => {
                    if (trackNames.indexOf(name) !== -1) {
                        track.relink()
                    } else {
                        track.unlink()
                    }
                })
                if (wasPlaying) {
                    this.playingStore.play()
                }
            })
        }
    }

    enabled() {
        // TODO: refactor so we just have a currentlyEnabled variable to read
        let currentlyEnabled = new Array<string>();
        this.subscribe((currentPlayers: Map<string, midiTrack>) => {
            currentPlayers.forEach((track, name) => {
                if (track.islinked()) {
                    currentlyEnabled.push(name)
                }
            })
        })()
        return currentlyEnabled
    }

    notes (trackNames: string[]):Map<string, TimedNotes> {
        let noteMap = new Map<string, TimedNotes>();
        this.subscribe((currentPlayers: Map<string, midiTrack>) => {
            currentPlayers.forEach((v, name) => {
                noteMap.set(name, new TimedNotes([]))
            })

            trackNames.forEach((name) => {
                if (!currentPlayers.has(name)) {
                    throw new Error(`There is no track called ${name}. Current tracks are ${Array.from(currentPlayers.keys())}`)
                }
                noteMap.set(name, currentPlayers.get(name).notes)
            })
        })()
        return noteMap
    }

    subscribeToNotesOfTracks(tracks: string[], onStateChange: (notes: Map<Note, string>) => void) {
        let unsubscribers = []
        tracks.forEach(track => {
            this.subscribe((currentPlayers: Map<string, midiTrack>) => {
                if (!currentPlayers.has(track)) {
                    throw new Error(`player has no track ${track}, has ${Array.from(currentPlayers.keys())}`)
                }

                unsubscribers.push(currentPlayers.get(track).interface().subscribeToNotes(onStateChange))
            })()
        })

        return ()=>{unsubscribers.forEach(u => u())}
    }

    setWaitModeStore(wms) {
        this.waitMode = wms
    }
}

class speed {
    private playingStore;
    private internalSet;
    subscribe;

    constructor(playingStore) {
        const { subscribe, set } = writable(1);
        this.subscribe = subscribe
        this.internalSet = set
        this.playingStore = playingStore
    }

    set(val: number) {
        this.playingStore.pause()
        if (val <= 0 || val > 1) {
            throw new Error("speeds must be between 0 and 1, got: " + val)
        } else {
            this.internalSet(val)
        }
    }
}
