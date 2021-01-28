import type { VirtualInstrument } from '../lib/track/instrument'
import type { TimedNote } from '../lib/music/timed/timed';
import type { TimedNotes } from '../lib/music/timed/timed';
import { get } from '../lib/util';
import { writable } from 'svelte/store';
import type { GameMaster } from './stores';
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
    currentNotes;
    gm: GameMaster;
    private linked: Boolean;

    constructor(notes: TimedNotes, playbackInstrument: VirtualInstrument, gm: GameMaster) {
        this.notes = notes
        this.currentPosition = 0;
        this.noteTimeouts = new Map();
        this.windowTimeouts = [];
        this.lastNoteWindow = -1;
        this.playbackInstrument = playbackInstrument
        this.currentNotes = writable(new Map<string, string>())
        this.playing = false
        this.linked = false
        // TODO: don't add the full game master. Just passing in relevant stores or functions will reduce scope creep and coupling.
        this.gm = gm
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
        let dur = get(this.gm.duration)
        const windowWidth = 10000 / dur // 10 seconds
        this.runWindow(this.currentPosition, windowWidth, dur)
    }

    // width and start are percentages
    runWindow(start: number, width: number, dur) {
        if (width + start <= 1) {
            this.windowTimeouts.push(setTimeout(() => {
                this.runWindow(start + width, width, dur)
            }, width * dur / get(this.gm.speed)))
        }

        let notes = this.notes.notesFrom(start, start + width)
        notes.forEach((note) => {
            this.triggerNote(note, start)
        })
    }

    triggerNote(note: TimedNote, pos: number) {
        let noteNumbers = new Map<string, number>();
        let length = (note.end - note.start) * get(this.gm.duration) / get(this.gm.speed)
        if (!noteNumbers.has(note.note.string())) {
            noteNumbers.set(note.note.string(), -1)
        }
        // how many of the current notes have been seen
        let noteNumber = noteNumbers.get(note.note.string()) + 1
        noteNumbers.set(note.note.string(), noteNumber)
        // Key to find all timeouts of this note
        const key = note.note.string() + noteNumber
        const lastKey = note.note.string() + (noteNumber - 1)
        if (!this.noteTimeouts.has(key)) {
            this.noteTimeouts.set(key, [])
        }

        // Define actions
        const startPlayable = () => {
            if (this.noteTimeouts.has(lastKey)) {
                this.noteTimeouts.get(lastKey).forEach((_, previousTimeout) => {
                    clearTimeout(previousTimeout)
                });
            }
            set("soft")()
        }

        const set = (noteState: string) => {
            return () => {
                // Set the note as being allowed to be played
                this.currentNotes.update((notes: Map<string, string>)=> {
                    notes.set(note.note.string(), noteState)
                    return notes
                })
            }
        }

        const playNote = () => {
            this.playbackInstrument.setVolume(note.velocity)
            this.playbackInstrument.play(note.note, length)
        }

        const requireNoteOff = () => {
            this.currentNotes.update((notes: Map<string, string>)=> {
                notes.delete(note.note.string())
                return notes
            })
        }
        
        // Take actions
        // TODO: handle cases where note is less than or near noteLeeway
        const noteLeeway = 100
        let firstNote = (note.start - pos) * get(this.gm.duration) / get(this.gm.speed)
        this.pushTimeout(key, startPlayable,    firstNote - noteLeeway)
        this.pushTimeout(key, playNote,         firstNote)
        this.pushTimeout(key, set("strict"),    firstNote + noteLeeway)
        this.pushTimeout(key, set("soft"),      firstNote + length - noteLeeway)
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
        this.currentNotes.set(new Map<string, string>())

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

    subscribeToNotes(callback: (notes: Map<string, string>)=> void) {
        return this.track.currentNotes.subscribe((notes)=>{
            callback(notes)
        })
    }
}