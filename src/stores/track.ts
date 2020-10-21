import type { Player } from '../components/audioplayer/audioplayer'
import { play } from '../components/audioplayer/spotify';
import type { TimedNote } from '../lib/music/timed/timed';
import type { instrument } from './instruments';
import { audioReady, songDuration, seek, playingStore } from "./stores"

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
    startTimeouts: Array<ReturnType<typeof setTimeout>>;
    endTimeouts: Array<ReturnType<typeof setTimeout>>;
    playbackInstrument: instrument;

    constructor(notes: Array<TimedNote>, playbackInstrument: instrument) {
        this.notes = notes
        this.currentPosition = 0;
        this.startTimeouts = new Array();
        this.endTimeouts = new Array();
        this.startedPlaying = -1;
        this.playbackInstrument = playbackInstrument
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
        this.notes.forEach((note)=>{
            if (note.start > this.currentPosition) {
                let delay = (note.start - this.currentPosition) * duration()
                let length = (note.end - note.start) * duration()
                this.startTimeouts.push(setTimeout(() => {
                    this.playbackInstrument.play(note.note)
                    this.endTimeouts.push(setTimeout(() => {
                    }, length))
                }, delay))
            }
        })
    }

    pause() {
        if (this.startedPlaying == -1) {
            this.currentPosition = 0
        } else {
            this.currentPosition = this.currentPosition + (Date.now() - this.startedPlaying)/duration()
        }

        this.endTimeouts.forEach((to) => {
            clearTimeout(to)
        })
        this.startTimeouts.forEach((to) => {
            clearTimeout(to)
        })
        this.endTimeouts = []
        this.startTimeouts = []
    }

    seek(d: number) {
        this.currentPosition = d
        if (playing()) {
            this.play()
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
        })
    }
}