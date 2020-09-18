import { niceBlue } from "../../../colours";
import { Chord, ChordBook, Note } from "../theory/chords"
// TODO: use the new yt method
// import { GetPlayer, Player } from "../youtube/youtube"

export class TimedChord {
    chord: Chord;
    start: number;
    end: number;
    completed: boolean;
    constructor(chord: Chord, start: number) {
        this.chord = chord
        this.start = start
        // set later once we receive a signal that it's done
        this.end = start
        this.completed = false
    }
}

export class Chart {
    chords: Array<TimedChord>;
    book: ChordBook;

    // recording related fields
    noteSetIndex: number;
    lastTime: number;
    player: Player;

    constructor (book: ChordBook) {
        this.book = book;
        this.chords = [];
        this.noteSetIndex = 0;
        this.lastTime = -1;
        // this.player = GetPlayer()
        this.renderLoop()
    }
    
    getPlayer() {
        if (this.player.underlying == undefined) {
            // this.player = GetPlayer()
        }
        return this.player
    }

    renderLoop() {
        // setInterval(() => {
        //     this.checkUpdates()
        // }, 1000)
    }

    checkUpdates() {
        var curr = this.currentPlayerTime()
        if (this.lastTime != curr) {
            this.chords.forEach((chord: TimedChord)=>{
                if (chord.start > curr) {
                    chord.completed = false
                }
            })
            this.render()
        }
        this.lastTime = curr
    }

    getCurrent() {
        // TODO: efficient lookup
        var currentTime = this.currentPlayerTime()
        console.log("current time " + currentTime)
        for (let i = 0; i < this.chords.length; i++) {
            // Assumes chords are properly ordered
            var chord = this.chords[i]
            if (currentTime < chord.end) {
                return this.chords[i]
            }
        }

        return this.chords[this.chords.length-1]
    }

    reactTo(notes: Array<Note>) {
        if (!this.isRecording()) {
            var current = this.getCurrent()
            if (current?.chord.strictEquals(notes)) {
                current.completed = true
            }
        } else {
            this.record(notes)
        }
        this.render()
    }

    render() {
        var desc = "";
        var time = this.currentPlayerTime()
        this.chords.forEach((chord, i) => {
            var newChord = chord.chord.string()
            if (chord.end < time) {
                newChord = newChord.strike()
            }

            if (chord.completed) {
                newChord = newChord.fontcolor(niceBlue)
            }

            desc += newChord + " "
        })
        desc = desc.substr(0, desc.lastIndexOf(" "))
        // var chordElem = <HTMLParagraphElement>document.querySelector("#chords")
        // chordElem.innerHTML = desc
    }

    // Recording related functions

     // State of a chord set is either recording or checking
    // if it's recording we are listening for new chords to add to the chart
    // if it's checking, it's determing whether the notes played have played the correct chord
    // in the chart
    // TODO: enum for each state
    isRecording():boolean {
        var recordingElem = <HTMLInputElement>document.querySelector("#recording")
        return recordingElem.checked
    }


    record(notes: Array<Note>) {
        this.noteSetIndex++

        var time = this.currentPlayerTime()
        var chord = this.book.recognise(notes)
        if (chord != undefined) {
            var noteSetIndex = this.noteSetIndex
            // Interval allows us to record chords with subchords. I.e., if Fmaj7 were played, F or Am
            // are subchords that likely would have been played milliseconds before
            setTimeout(() => {
                if (noteSetIndex == this.noteSetIndex) {
                    this.chords.push(new TimedChord(<Chord>chord, time))
                    this.render()
                }
            }, 100);
        }

        var mostRecent = this.mostRecentChordStarted(time)
        if (mostRecent == undefined) {
            throw "most recent chord at " + time + " is undefined   "
        }
        mostRecent.end = time
    }

    mostRecentChordStarted (time: number){
        for (let i = 0; i < this.chords.length; i++) {
            if (this.chords[i]==undefined) {
                throw "undefined chord " + i
            }
        }
        for (let i = 1; i < this.chords.length; i++) {
            const lastChord = this.chords[i-1];
            const thisChord = this.chords[i];
            if (thisChord.start > time) {
                return lastChord
            }
        }

        return this.chords[this.chords.length-1]
    }

    currentPlayerTime() {
        return this.getPlayer().getCurrentTime()
    }
}