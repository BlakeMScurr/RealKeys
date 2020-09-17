import WebMidi, { InputEventNoteon, InputEventNoteoff } from "webmidi";
import { Chord, ChordBook, Note, NewAbstractNote, noteString } from "./music/theory/chords";
import { Chart } from "./music/chart/chart"
import { Score } from "./music/score/score"
// import { Player } from "./youtube/youtube"

// TODO: merge with blackKeys
function whiteKeys(keys: Array<Note>) {
    let whites: Array<Note> = [];
    keys.forEach(key => {
        if (white(key)){
            whites.push(key)
        }
    });
    return whites
}

function white(key: Note) {
    return !key.abstract.accidental
}

// Black keys includes ghost black keys like the key that would be between b and c
function physicalBlackKeys(keys: Array<Note>) {
    let blacks: Array<Note> = [];
    var lastWasWhite = true;
    keys.forEach(key => {
        if (!white(key)) {
            blacks.push(key)
            lastWasWhite = false
        } else {
            if (lastWasWhite) {
                blacks.push(new Note(NewAbstractNote("X"), -1776))
                lastWasWhite = false
            } else {
                lastWasWhite = true
            }
        }
    });
    return blacks
}

class Piano {
    // logic
    keys: Array<Note>;
    pressed: Map<string, Note>;
    chords: Chart; // TODO: make a piano output current notes, rather than knowing about chords
    onChordChange: (c: (Chord|undefined)) => void;

    // rendering
    context: CanvasRenderingContext2D;
    width: number;
    height: number;
    keyWidth: number;

    constructor(canvas: HTMLCanvasElement, keys: Array<Note>, chords: Chart, onChordChange: (c: (Chord|undefined)) => void) {
        this.onChordChange = onChordChange
        this.context = <CanvasRenderingContext2D>canvas.getContext('2d')
        this.keys = keys
        this.pressed = new Map()

        this.width = window.innerWidth

        this.keyWidth = this.width / (whiteKeys(this.keys).length)
        this.height = window.innerHeight * 0.25;
        canvas.width = this.width
        canvas.height = this.height
        this.chords = chords
    }

    currentNotes(): Array<Note>{
        var notes: Array<Note> = [];
        this.pressed.forEach((note, name) => {
            if (name) {
                notes.push(note)
            }
        });

        return notes
    }

    render() {
        // Clear the canvas
        this.context.clearRect(0, 0, this.width, this.height)

        // Draw the white keys
        var x = 0;
        this.keys.forEach(key => {
            this.context.fillStyle = "#FFFFFF";
            if (this.pressed.has(key.string())) {
                this.context.fillStyle = "#00FF00";
            }

            if (white(key)) {
                this.context.fillRect(x*this.keyWidth, 0, this.keyWidth-1, this.height)
                x += 1
            }
        });

        // Draw the black keys
        var x = 0;
        this.keys.forEach(key => {
            this.context.fillStyle = "#000000";
            if (this.pressed.has(key.string())) {
                this.context.fillStyle = "#00FF00";
            }

            if (!white(key)) {
                this.context.fillRect((x - 0.25)*this.keyWidth , 0, this.keyWidth/2, this.height/2)
            } else {
                x += 1
            }
        });
    }

    NoteChange() {
        // CheckSuccess
        this.chords.reactTo(this.currentNotes())

        // Recognise Chord
        var currChord = <Chord>book.recognise(this.currentNotes())
        this.onChordChange(currChord)
    }
    
    pressKey(note: Note) {
        this.pressed.set(note.string(), note)
        this.render()
        this.NoteChange()
    }

    releaseKey(note: Note) {
        this.pressed.delete(note.string())
        this.render()
        this.NoteChange()
    }

    // Handles midi keyboard note playing
    pianoKeyPressed(name: string, octave: number) {
        this.pressKey(new Note(NewAbstractNote(name), octave))
    }

    // Handles midi keyboard note releasing
    pianoKeyReleased(name: string, octave: number) {
        this.releaseKey(new Note(NewAbstractNote(name), octave))
    }

    // Handles computer keyboard note playing
    keyUp(event: KeyboardEvent) {
        this.releaseKey(this.keyboardInputNote(event.keyCode))
    }

    // Handles computer keyboard note releasing
    keyDown(event: KeyboardEvent) {
        this.pressKey(this.keyboardInputNote(event.keyCode))
    }

    // Keys the note repsented by a key on the computer keyboard
    keyboardInputNote(keyCode: number):Note {
        // TODO: don't assume wasd
        let key: string = String.fromCharCode(keyCode).toLocaleLowerCase()

        // handle naturals
        var naturals = ["a","s","d","f","g","h","j","k","l",";"]
        var index = naturals.indexOf(key)
        if (index != -1) {
            return whiteKeys(this.keys)[index]
        }

        // handle black notes
        var blackKeys = ["q","w","e","r","t","y","u","i","o","p","["]
        var index = blackKeys.indexOf(key)
        if (index != -1) {
            return physicalBlackKeys(this.keys)[index]
        }

        throw key + " is not on our keyboard"
    }
}

function octavesFrom(note: Note, octavesLeft: number) {
    if (!white(note)) {
        throw "the notes on a keyboard must start from a white note, otherwise there'll be a weird half note space at the end of the keyboard"
    }

    var notes = [];
    while (octavesLeft > 0) {
        var notesLeft = 12
        while (notesLeft > 0) {
            notes.push(note)
            notesLeft--
            note = note.next()
        }
        octavesLeft--
    }

    notes.push(note)
    return notes
}

let book = new ChordBook()
let chords = new Chart(book)
let onChordChange = (chord: (Chord|undefined)) => {
    var currentChord = <HTMLParagraphElement>(document.querySelector("#currentChord"))
    if (chord == undefined) {
        currentChord.innerHTML = "-"
    } else {
        currentChord.innerHTML = (<Chord>(chord)).string()
    }
}

const piano = new Piano(<HTMLCanvasElement>document.querySelector("#piano"), octavesFrom(new Note(NewAbstractNote("c"), 3), 3), chords, onChordChange);

// Setup interactions
document.addEventListener('keydown', (event) => {
    piano.keyDown(event)
});

document.addEventListener('keyup', (event) => {
    piano.keyUp(event)
});

WebMidi.enable(function (err) {
    if (err) {
        console.log("WebMidi could not be enabled.", err);
    }
    // TODO: make sure we get the right input by checking all possible inputs
    // TODO: listen for midi being plugged in
    try {
        WebMidi.inputs[0].addListener('noteon', "all", (e: InputEventNoteon) => {
          piano.pianoKeyPressed(e.note.name, e.note.octave)
        });
        WebMidi.inputs[0].addListener('noteoff', "all", (e: InputEventNoteoff) => {
            piano.pianoKeyReleased(e.note.name, e.note.octave)
        });
    } catch (e) {}
});

var score = new Score();

var prev = <HTMLButtonElement>document.querySelector("#previousPage")
var next = <HTMLButtonElement>document.querySelector("#nextPage")
var test = <HTMLButtonElement>document.querySelector("#tester")
next.onclick = () => {
    console.log("turning to next page")
    score.nextPage()
}
prev.onclick = () => {
    console.log("previouspage")
    score.previousPage()
}
test.onclick = () => {
    console.log("found location:")
    console.log(score.findLocation(10))
}

// initial rendering
score.render();
piano.render();
chords.render();

interface Player {
    stopVideo():any
    startVideo():any
}
interface Window {
    player?: Player;
}

// YouTube Stuff
setTimeout(()=>{
    var w: Window = <Window>window;
    var player: any = <Player>w.player;
    
    // setTimeout(player.startVideo(), 1000);
    // setTimeout(player.stopVideo(), 3000);
}, 5000)

