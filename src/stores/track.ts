import type { VirtualInstrument } from '../lib/track/instrument'
import type { TimedNote, TimedNotes } from '../lib/music/timed/timed';
import type { Note } from '../lib/music/theory/notes';
import { get } from '../lib/util';
import { Readable, Writable, writable } from 'svelte/store';
import type { GameMaster } from './stores';

export enum noteState {
    softStart = "softStart",
    softEnd = "softEnd",
    soft = "soft",
    strict = "strict",
    expecting = "expecting",
}

export function isSoft(state: noteState):boolean {
    return state === noteState.softStart || state === noteState.softEnd || state === noteState.soft
}

export class midiTrack {
    notes: TimedNotes;
    currentPosition: number;
    lastNoteWindow: number;
    playing: Boolean;
    // Map from note (given by note string + the index of that particular note in the song) to the timeouts used to deal with it
    // This was changed from the more obvious Array<ReturnType<typeof setTimeout>> so we could clear timeouts for previous notes
    // of the same pitch
    // TODO: test whether it's actually necessary
    noteTimeouts: Map<string, Array<ReturnType<typeof setTimeout>>>;
    windowTimeouts: Array<ReturnType<typeof setTimeout>>;
    playbackInstrument: VirtualInstrument;
    currentNotes: Writable<Map<Note, noteState>>;
    gm: GameMaster;
    private noteNumbers: Map<string, number>;

    private linked: Boolean;

    constructor(notes: TimedNotes, playbackInstrument: VirtualInstrument, gm: GameMaster) {
        this.notes = notes
        this.currentPosition = 0;
        this.noteTimeouts = new Map();
        this.windowTimeouts = [];
        this.lastNoteWindow = -1;
        this.playbackInstrument = playbackInstrument
        this.currentNotes = writable(new Map<Note, noteState>())
        this.playing = false
        this.linked = false
        // TODO: don't add the full game master. Just passing in relevant stores or functions will reduce scope creep and coupling.
        this.gm = gm
        this.noteNumbers = new Map<string, number>();
    }

    // links the track to stores
    linkCalled: Boolean = false;
    link() {
        if (this.linkCalled) {
            throw new Error("link already called on track")
        }
        this.linkCalled = true
        this.linked = true

        this.gm.seek.subscribe((p) => {
            if (this.linked) {
                this.seek(p)
            }
        })
    
        this.gm.play.subscribe((play) => {
            if (this.linked) {
                if (play) {
                    this.play()
                } else {
                    this.pause()
                }
            }
        })
    }

    unlink() {
        this.pause()
        this.linked = false
    }

    relink() {
        this.linked = true
    }

    islinked() {
        return this.linked
    }

    pushTimeout(key, cb, dur) {
        if (this.noteTimeouts.has(key)) {
            this.noteTimeouts.get(key).push(setTimeout(cb, dur))
        }
    }

    play() {
        let dur = get(<Readable<number>>this.gm.duration)
        const windowWidth = 10000 / dur // 10 seconds
        this.runWindow(this.currentPosition, windowWidth, dur)
    }

    // width and start are percentages
    runWindow(start: number, width: number, dur) {
        if (width + start <= 1) {
            this.windowTimeouts.push(setTimeout(() => {
                this.runWindow(start + width, width, dur)
            }, width * dur / get(<Readable<number>>this.gm.speed)))
        }

        let notes = this.notes.notesFrom(start, start + width)
        notes.forEach((note) => {
            this.triggerNote(note, start)
        })
    }

    triggerNote(note: TimedNote, pos: number) {
        let length = (note.end - note.start) * get(<Readable<number>>this.gm.duration) / get(<Readable<number>>this.gm.speed)
        let ns = note.note.string()
        if (!this.noteNumbers.has(ns)) {
            this.noteNumbers.set(ns, -1)
        } else {
            this.noteNumbers.set(ns, this.noteNumbers.get(ns) + 1)
        }
        // how many of the current notes have been seen
        let noteNumber = this.noteNumbers.get(ns)
        this.noteNumbers.set(ns, noteNumber)
        // Key to find all timeouts of this note
        const key = ns + noteNumber
        const lastKey = ns + (noteNumber - 1)


        if (!this.noteTimeouts.has(key)) {
            this.noteTimeouts.set(key, [])
        }

        // Define actions
        const startPlayable = () => {
            if (this.noteTimeouts.has(lastKey)) {
                this.noteTimeouts.get(lastKey).forEach((previousTimeout) => {
                    clearTimeout(previousTimeout)
                });
            }
            // TODO: make the names of set soft and playable the same
            set(noteState.softStart)()
        }

        const set = (noteState: noteState) => {
            return () => {
                // Set the note as being allowed to be played
                this.currentNotes.update((notes: Map<Note, noteState>)=> {
                    notes.set(note.note, noteState)
                    return notes
                })
            }
        }

        const playNote = () => {
            this.playbackInstrument.play(note.note, length, note.velocity)
        }

        const requireNoteOff = () => {
            this.currentNotes.update((notes: Map<Note, noteState>)=> {
                notes.delete(note.note)
                return notes
            })
        }
        
        // Take actions
        // TODO: handle cases where note is less than or near noteLeeway
        const noteLeeway = 100
        let firstNote = (note.start - pos) * get(<Readable<number>>this.gm.duration) / get(<Readable<number>>this.gm.speed)
        this.pushTimeout(key, startPlayable,    firstNote - noteLeeway)
        this.pushTimeout(key, playNote,         firstNote)
        this.pushTimeout(key, set(noteState.strict),    firstNote + noteLeeway)
        this.pushTimeout(key, set(noteState.softEnd),      firstNote + length - noteLeeway)
        this.pushTimeout(key, requireNoteOff,   firstNote + length + noteLeeway)
    }

    pause() {
        this.gm.position.subscribe(p => {
            this.currentPosition = p
        })

        this.windowTimeouts.forEach((to) => {
            clearTimeout(to)
        })
        this.windowTimeouts = [];

        this.noteTimeouts.forEach((tos) => {
            tos.forEach((to) => {
                clearTimeout(to)
            })
        })

        this.noteTimeouts = new Map();
        this.currentNotes.set(new Map<Note, noteState>())

    }

    seek(d: number) {
        this.currentPosition = d
        if (get(this.gm.play)) {
            this.play()
        }
    }

    interface() {
        return new playbackInterface(this)
    }
}

class playbackInterface {
    track: midiTrack;
    constructor(track: midiTrack) {
        this.track = track
    }

    subscribeToNotes(callback: (notes: Map<Note, noteState>)=> void) {
        return this.track.currentNotes.subscribe((notes)=>{
            callback(notes)
        })
    }
}