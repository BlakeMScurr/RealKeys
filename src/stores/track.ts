import type { Player } from '../components/audioplayer/audioplayer'
import type { TimedNote } from '../lib/music/timed/timed';
import type { instrument } from './instruments';
import { audioReady, songDuration, seek, playingStore } from "./stores"
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

export class playbackTrack {
    notes: Array<TimedNote>;
    currentPosition: number;
    startedPlaying: number;
    // Map from note (given by note string + the index of that particular note in the song) to the timeouts used to deal with it
    // This was changed from the more obvious Array<ReturnType<typeof setTimeout>> so we could clear timeouts for previous notes
    // of the same pitch
    // TODO: test whether it's actually necessary
    timeouts: Map<string, Array<ReturnType<typeof setTimeout>>>;
    playbackInstrument: instrument;
    currentNotes;

    constructor(notes: Array<TimedNote>, playbackInstrument: instrument) {
        this.notes = notes
        this.currentPosition = 0;
        this.timeouts = new Map();
        this.startedPlaying = -1;
        this.playbackInstrument = playbackInstrument
        this.currentNotes = writable(new Map<string, string>())
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
        if (this.timeouts.has(key)) {
            this.timeouts.get(key).push(setTimeout(cb, dur))
        }
    }

    play() {
        this.startedPlaying = Date.now()
        let leeway;
        noteLeeway.subscribe((val) => {
            leeway = val
        })
        
        let noteNumbers = new Map<string, number>();
        this.notes.forEach((note)=>{
            if (note.start > this.currentPosition) {
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
                this.timeouts.set(key, [])

                // Define actions
                const startPlayable = () => {
                    if (this.timeouts.has(lastKey)) {
                        this.timeouts.get(lastKey).forEach((_, previousTimeout) => {
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
                // TODO: handle cases where note is less than or near leeway
                let firstNote = (note.start - this.currentPosition) * duration()
                this.pushTimeout(key, startPlayable,    firstNote - leeway)
                this.pushTimeout(key, playNote,         firstNote)
                this.pushTimeout(key, set("strict"),    firstNote + leeway)
                this.pushTimeout(key, set("soft"),      firstNote + length - leeway)
                this.pushTimeout(key, requireNoteOff,   firstNote + length + leeway)
            }
        })
    }

    pause() {
        if (this.startedPlaying == -1) {
            this.currentPosition = 0
        } else {
            this.currentPosition = this.currentPosition + (Date.now() - this.startedPlaying)/duration()
        }

        this.timeouts.forEach((tos) => {
            tos.forEach((to) => {
                clearTimeout(to)
            })
        })
        this.timeouts = new Map();
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
    track: playbackTrack;
    constructor(track: playbackTrack) {
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

export class track {
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
            console.log("playing track 2")
        })
    }
}