import type { Player } from '../components/audioplayer/audioplayer'
import type { TimedNote } from '../lib/music/timed/timed';
import type { Note } from '../lib/music/theory/notes';
import type { instrument } from './instruments';
import { audioReady, songDuration, seek, playingStore } from "./stores"
import { writable } from 'svelte/store';

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
    timeouts: Array<ReturnType<typeof setTimeout>>;
    playbackInstrument: instrument;
    currentNotes;

    constructor(notes: Array<TimedNote>, playbackInstrument: instrument) {
        this.notes = notes
        this.currentPosition = 0;
        this.timeouts = new Array();
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

    play() {
        this.startedPlaying = Date.now()
        const leeway = 100 // ms

        this.notes.forEach((note)=>{
            if (note.start > this.currentPosition) {
                // TODO: handle cases where note is less than or near leeway
                let firstNote = (note.start - this.currentPosition) * duration()
                let softOn = firstNote - leeway

                let length = (note.end - note.start) * duration()

                this.timeouts.push(setTimeout(() => {
                    // Set the note as being allowed to be played
                    this.currentNotes.update((notes: Map<string, string>)=> {
                        notes.set(note.note.string(), "soft")
                        return notes
                    })
                }, softOn))

                // Play the note
                this.timeouts.push(setTimeout(() => {
                    this.playbackInstrument.play(note.note, length)

                    // Set the note as having to be played
                    this.timeouts.push(setTimeout(() => {
                        this.currentNotes.update((notes: Map<string, string>)=> {
                            notes.set(note.note.string(), "strict")
                            return notes
                        })
                    }, leeway * 2))

                    // Set the note as being allowed to be off
                    this.timeouts.push(setTimeout(() => {
                        this.currentNotes.update((notes: Map<string, string>)=> {
                            notes.set(note.note.string(), "soft")
                            return notes
                        })

                        // Set the note as being required to be off
                        this.timeouts.push(setTimeout(() => {
                            this.currentNotes.update((notes: Map<string, string>)=> {
                                notes.delete(note.note.string())
                                return notes
                            })
                        }, leeway * 2))
                    }, length - leeway))
                }, firstNote))
            }
        })
    }

    pause() {
        if (this.startedPlaying == -1) {
            this.currentPosition = 0
        } else {
            this.currentPosition = this.currentPosition + (Date.now() - this.startedPlaying)/duration()
        }

        this.timeouts.forEach((to) => {
            clearTimeout(to)
        })
        this.timeouts = []
    }

    seek(d: number) {
        this.currentPosition = d
        if (playing()) {
            this.play()
        }
    }

    subscribeToNotes(callback: (notes: Map<string, string>)=> void) {
        this.currentNotes.subscribe((notes)=>{
            callback(notes)
        })
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
        })
    }
}