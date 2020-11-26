import type { Player } from '../components/audioplayer/audioplayer'
import type { TimedNote } from '../lib/music/timed/timed';
import { TimedNotes } from '../lib/music/timed/timed';
import type { instrument } from './instruments';
import { audioReady, songDuration, seek, playingStore, position, frameLength } from "./stores"
import { writable } from 'svelte/store';
import { noteLeeway } from "./settings"

function duration():number {
    let dur;
    songDuration.subscribe((d) => {
        dur = d
    })
    return dur
}

function playing():Boolean {
    let playing
    playingStore.subscribe((play) => {
        playing = play
    })
    return playing
}

export class midiTrack {
    notes: TimedNotes;
    currentPosition: number;
    startedPlaying: number;
    lastNoteWindow: number;
    playing: Boolean;
    // Map from note (given by note string + the index of that particular note in the song) to the timeouts used to deal with it
    // This was changed from the more obvious Array<ReturnType<typeof setTimeout>> so we could clear timeouts for previous notes
    // of the same pitch
    // TODO: test whether it's actually necessary
    noteTimeouts: Map<string, Array<ReturnType<typeof setTimeout>>>;
    windowTimeouts: Array<ReturnType<typeof setTimeout>>;
    playbackInstrument: instrument;
    currentNotes;

    constructor(notes: Array<TimedNote>, playbackInstrument: instrument) {
        this.notes = new TimedNotes(notes)
        this.currentPosition = 0;
        this.noteTimeouts = new Map();
        this.windowTimeouts = [];
        this.startedPlaying = -1;
        this.lastNoteWindow = -1;
        this.playbackInstrument = playbackInstrument
        this.currentNotes = writable(new Map<string, string>())
        this.playing = false
    }

    // links the track to stores
    link() {
        seek.subscribe((p) => {
            this.seek(p)
        })

        playingStore.subscribe((play) => {
            if (play) {
                this.play()
            } else {
                this.pause()
            }
        })
    }

    pushTimeout(key, cb, dur) {
        if (this.noteTimeouts.has(key)) {
            this.noteTimeouts.get(key).push(setTimeout(()=>{
                cb()
                clearTimeout(this.noteTimeouts.get(key)[0])
                this.noteTimeouts.get(key).shift()
            }, dur))
        }
    }

    play() {
        let dur = duration()
        console.log("duration", dur)
        const windowWidth = 10000 / dur // 10 seconds
        this.runWindow(this.currentPosition, windowWidth, dur)
    }

    // width and start are percentages
    runWindow(start: number, width: number, dur) {
        if (width + start <= 1) {
            this.windowTimeouts.push(setTimeout(() => {
                this.runWindow(start + width, width, dur)
            }, width * dur))
        }

        let notes = this.notes.notesFrom(start, start + width)
        console.log("starting", notes.length, "notes in this window")
        notes.forEach((note) => {
            this.triggerNote(note, start)
        })
    }

    triggerNote(note: TimedNote, pos: number) {
        let noteNumbers = new Map<string, number>();
        let length = (note.end - note.start) * duration()
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
        let firstNote = (note.start - pos) * duration()
        this.pushTimeout(key, startPlayable,    firstNote - noteLeeway)
        this.pushTimeout(key, playNote,         firstNote)
        this.pushTimeout(key, set("strict"),    firstNote + noteLeeway)
        this.pushTimeout(key, set("soft"),      firstNote + length - noteLeeway)
        this.pushTimeout(key, requireNoteOff,   firstNote + length + noteLeeway)
    }

    pause() {
        if (this.startedPlaying == -1) {
            this.currentPosition = 0
        } else {
            this.currentPosition = this.currentPosition + (Date.now() - this.startedPlaying)/duration()
        }

        this.windowTimeouts.forEach((to) => {
            clearTimeout(to)
        })
        this.windowTimeouts = [];

        this.noteTimeouts.forEach((tos) => {
            tos.forEach((to) => {
                console.log("clearing timeout")
                clearTimeout(to)
            })
        })

        console.log("done clearing timeouts")
        this.noteTimeouts = new Map();
        this.currentNotes.set(new Map<string, string>())

    }

    seek(d: number) {
        this.currentPosition = d
        if (playing()) {
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
        this.track.currentNotes.subscribe((notes)=>{
            callback(notes)
        })
    }

    updateNotes(notes: Array<TimedNote>) {
        if (playing()) {
            this.track.pause()
            this.track.notes = notes
            this.track.play()
        } else {
            this.track.notes = notes
        }
    }
}

export class audioTrack {
    player: Player;
    constructor(player: Player) {
        this.player = player
    }

    // links the track to stores
    link() {
        audioReady.ready()
        let duration = this.player.Duration()
        songDuration.set(duration)

        seek.subscribe((p) => {
            let dur;
            songDuration.subscribe((d) => {
                dur = d
            })
            this.player.Seek(p * dur)
        })

        playingStore.subscribe((play) => {
            if (play) {
                this.player.Play()
            } else {
                this.player.Pause()
            }
        })
    }
}