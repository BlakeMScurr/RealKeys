import { Note, NewAbstractNote, NoteOrder, NewNote } from "./notes";

// TODO: replace with enum, fix weird "cannot find name" error
export const semitonesIn: Map<string, number> = new Map([
    ["Semitone", 1],
    ["Tone", 2],
    ["Minor3rd", 3],
    ["Major3rd", 4],
    ["Perfect4th", 5],
    ["Augmented4th", 6],
    ["Perfect5th", 7],
    ["Minor6th", 8],
    ["Major6th", 9],
    ["Minor7th", 10],
    ["Major7th", 11],
])

class ChordType {
    intervals: Array<string>;
    symbol: string;
    description: string;

    // The chord implies a key. How many sharps does that key have? This is used to figure out
    // the natural representation of the chord - i.e., D# or Eb major 7.
    sharpsInC: number;

    constructor(intervals: Array<string>, symbol: string, description: string, sharpsInC: number) {
        this.symbol = symbol
        this.description = description
        this.intervals = intervals
        this.sharpsInC = sharpsInC
    }
}

export class ChordBook {
    symbolMap: Map<string, ChordType>;

    constructor () {
        // var flat = () => {return "&#9837;"}
        var flat = () => {return "b"} // TODO: render proper html entity
        this.symbolMap = new Map([
            // TODO: remove repeated symbol
            ["5", new ChordType(new Array("Perfect5th"), "5", "power chord", 0)],
            ["sus2", new ChordType(new Array("Tone", "Perfect4th"), "sus2", "suspended second", 0)],

            ["dim", new ChordType(new Array("Minor3rd", "Minor3rd"), "dim", "diminished triad", -5)],
            ["dim7", new ChordType(new Array("Minor3rd", "Minor3rd","Minor3rd"), "dim7", "diminished 7th", -5)], // TODO: 5 flats (i.e., Db major) doesn't actually contain a full diminished chord
            ["m7" + flat() +"5", new ChordType(new Array("Minor3rd", "Minor3rd","Major3rd"), "m7" + flat() +"5", "half diminished", -5)],

            ["m", new ChordType(new Array("Minor3rd", "Major3rd"), "m", "minor triad position", -3)],
            ["m7", new ChordType(new Array("Minor3rd", "Major3rd", "Minor3rd"), "m7", "minor 7th", -3)],
            ["m9", new ChordType(new Array("Minor3rd", "Major3rd", "Minor3rd", "Major3rd"), "m9", "minor9th", -3)],

            ["", new ChordType(new Array("Major3rd", "Minor3rd"), "", "major triad", 0)],
            ["6", new ChordType(new Array("Major3rd", "Minor3rd", "Tone"), "6", "6th", 0)],
            ["add9", new ChordType(new Array("Major3rd", "Minor3rd", "Perfect5th"), "add9", "added ninth", 0)],
            ["7", new ChordType(new Array("Major3rd", "Minor3rd", "Minor3rd"), "7", "7th", -1)],
            [(flat() +"9"), new ChordType(new Array("Major3rd", "Minor3rd", "Minor3rd", "Minor3rd"), (flat() +"9"), "flat 9th", -4)],
            ["#9", new ChordType(new Array("Major3rd", "Minor3rd", "Minor3rd", "Perfect4th"), "#9", "sharp 9th", -4)],
            ["9", new ChordType(new Array("Major3rd", "Minor3rd", "Minor3rd", "Major3rd"), "9", "9th", -1)],
            ["maj7", new ChordType(new Array("Major3rd", "Minor3rd", "Major3rd"), "maj7", "major 7th", 0)],
            ["maj9", new ChordType(new Array("Major3rd", "Minor3rd", "Major3rd", "Minor3rd"), "maj9", "major 9th", 0)],

            ["aug", new ChordType(new Array("Major3rd", "Major3rd"), "aug", "augmented triad", 0)],

            ["sus4", new ChordType(new Array("Perfect4th", "Tone"), "sus4", "suspended fourth", 0)],
        ]);
    }

    // infer the right set of chords from a comma separated list of chord symbols
    infer(text: string) {
        var chords: Array<Chord> = [];
        var symbols = text.trim().split(" ")
        
        if (symbols.length == 1 && symbols[0].length == 0) { // TODO: find a nicer workaround - JS is bad and: "".split(" ") -> [""] instead of []
            symbols = [];
        }

        symbols.forEach(symbol => {
            // TODO: use nice regex or something else more succinct
            var root = symbol[0].toLocaleLowerCase();
            if (symbol[1] == "#") {
                root += "#"
            }

            if (symbol[1] == "b") {
                root += "b"
            }

            var flavour: string = symbol;
            var bassNote: string = "";
            if (symbol.includes("/")) {
                bassNote = symbol.substring(symbol.indexOf("/")+1)
                flavour = symbol.substring(0, symbol.indexOf("/"))
            }

            // start in fourth octave with middle c
            var newChord = this.make(NewNote(NewAbstractNote(root).string(), 4), flavour.substring(root.length), true, true)

            if (bassNote != "") {
                var inversion = -1;
                newChord.notes.forEach((note, index)=>{
                    if (note.getAbstract().string() == bassNote.toLocaleLowerCase() || note.getAbstract().enharmonicEquivalent() == bassNote) {
                        inversion = index
                    }
                })

                if (inversion == -1) {
                    throw "The chord " + symbol + " doesn't have a " + bassNote + ` note, and slash chords currently denote inversions.
                    For example, F/G is invalid in the existing system, though it's a reasonable and nice dominant chord.`
                }

                newChord = newChord.invert(inversion)
            }
           
            chords.push(newChord)

        })
        return chords
    }

    // TODO: voicing booleans as options
    make(root: Note, symbol: string, octaveIndependent: boolean, voicingIndependent: boolean) {
        
        // Ensure the chord type exists
        // TODO: more succinct way - does ? throw an error?
        var possibleType = this.symbolMap.get(symbol)
        if (!possibleType) {
            throw "chord " + symbol + " unknown"
        }
        var type = <ChordType>possibleType
        var chord = new Chord(root, symbol, type.sharpsInC);

        type.intervals.forEach((interval) => {
            chord.stack(interval);
        });
        return chord
    }

    recognise(notes: Array<Note>):Chord|undefined {
        if (notes.length != 0) {
            notes = sortNotes(notes)

            // Check if it's strictly equal to any root chords in it's current position
            for (const [symbol, value] of this.symbolMap) { 
                var chord = this.make(notes[0], symbol, true, true)
                if (chord.strictEquals(notes)) {
                    return chord
                }
            }

            // Check if it's equal to any possible inversions in some arbitrary voicing
            notes = squashNotes(notes)
            for (var i = 0; i < notes.length; i++) {
                var note = notes[i]
                for (const [symbol, value] of this.symbolMap) { 
                    var chord = this.make(note, symbol, true, true)
                    for (const inversion of chord.inversions()){
                        inversion.notes = squashNotes(inversion.notes)
                        if (inversion.strictEquals(notes)) {
                            return inversion
                        }
                    }
                }
            }
        }
    }
}


// TODO: make a notelist type and add this is a method
// TODO: unexport
export function sortNotes(notes: Array<Note>):Array<Note> {
    notes = notes.sort((a: Note, b: Note) => {
        // TODO: shorten using fancy js number bool stuff
        if (a.lowerThan(b)) {
            return -1
        }
        return 1
    })
    return notes
}

// TODO: make a notelist type and add this is a method
// TODO: unexport
export function noteString(notes: Array<Note>) {
    return notes.map((note: Note)=>{
        return note.string()
    }).join(", ")
}

// squashNotes removes all repeated notes and puts all the notes in the same octave
// while keeping the same root/lowest note
// TODO: make a notelist type and add this is a method
// TODO: unexport
// TODO: reduce number of arrays declared if possible - they were created while debugging apparent side effects in the function
export function squashNotes(notes: Array<Note>):Array<Note>{
    var sortedNotes = sortNotes(notes)

    // remove repeats
    var has: Map<String, boolean> = new Map();
    var uniqueNotes: Array<Note> = [];
    sortedNotes.forEach(note => {
        if (!has.has(note.getAbstract().string())) {
            uniqueNotes.push(note.deepCopy())
            has.set(note.getAbstract().string(), true)
        }
    })

    // squash into one octave
    var lowest = uniqueNotes[0]
    var squashedNotes: Array<Note> = [lowest];
    for (var i = 1; i < uniqueNotes.length; i++) {
        var note = uniqueNotes[i]
        note = NewNote(note.getAbstract().string(), lowest.getOctave()) 
        if (note.lowerThan(lowest)) {
            note = NewNote(note.getAbstract().string(), note.getOctave() + 1)
        }
        squashedNotes.push(note)
    }

    return sortNotes(squashedNotes)
}


// Chords are actually strict voicings, and use octaved notes, not abstract notes
export class Chord {
    symbol: string;
    root: Note;
    notes: Array<Note>;
    inversion: number;
    sharpsInC: number;

    constructor(note: Note, symbol: string, sharpsInC: number) {
        this.symbol = symbol
        this.root = note
        this.notes = [note]
        this.inversion = 0;
        this.sharpsInC = sharpsInC
    }

    stack(interval: string) {
        var semitones = semitonesIn.get(interval)
        if (semitones == undefined) {
            throw "undefined interval " + interval
        }
        var index = NoteOrder.indexOf(this.highest().getAbstract()) + <number>semitones
        var nextAbstractNote = NoteOrder[index % 12]
        var newNote = NewNote(nextAbstractNote.string(), this.highest().getOctave() + Math.floor(index/12));
        this.notes.push(newNote)
        return this
    }

    highest() {
        return this.notes[this.notes.length-1]
    }

    lowest() {
        return this.notes[0]
    }

    // strictEquals returns true if the notes are the same in strict order, but they remain octave independent
    // TODO: allow octave checking
    strictEquals(notes: Array<Note>) {
        notes = sortNotes(notes)

        // check notes against chord
        // TODO: perhaps more detailed help notes
        if (this.notes.length != notes.length) {
            return false
        }
        for (var i = 0; i < this.notes.length; i++) {
            if (notes[i] != undefined && this.notes[i].getAbstract().string() != notes[i].getAbstract().string()) {
                return false
            }
        }

        return true
    }

    // inversions returns all inversions of the chord
    inversions():Array<Chord> {
        var inversions: Array<Chord> = [];
        for (var i = 0; i < this.notes.length; i++) {
            inversions.push(this.invert(i))
        }
        return inversions
    }

    invert(inversionNumber: number):Chord {
        var delta = (inversionNumber - this.inversion + this.notes.length) % this.notes.length // avoids js negative modulus funny business
        var newChord: Chord = this.deepCopy()
        for (var i = 0; i < delta; i++) {
            newChord.inversion = (newChord.inversion + 1) % newChord.notes.length
            var nn = <Note>newChord.notes.shift()
            nn = NewNote(nn.getAbstract().string(), nn.getOctave() + 1)
            newChord.notes.push(nn)
        }

        // Chords whose root positions span multiple octaves like add9 are weird. When we add the root
        // to the end of the notes array it is not actually the higest note, and thus needs to be sorted again
        // TODO: new representation, perhaps a distinction between slash chords and inversions, that avoids this confusion
        newChord.notes = sortNotes(newChord.notes)
        return newChord
    }

    // voicingEquals checks whether the notes are a voicing of the chord and return the inversion of that chord
    voicingEquals(notes: Array<Note>) {

    }

    // JSON Parse Stringify doesn't cut it because we don't get deeply typed objects
    deepCopy() {
        var newChord = new Chord(this.root, this.symbol, this.sharpsInC)
        newChord.inversion = this.inversion
        newChord.notes = []
        this.notes.forEach((note: Note)=>{
            newChord.notes.push(note.deepCopy())
        })
        return newChord
    }

    string() {
        // Stuff to figure out whether to render as flat or not
        var sharpsImpliedByChord = <number>sharps.get(this.root.getAbstract().string())+ this.sharpsInC
        var isFlat = sharpsImpliedByChord < 0 && sharpsImpliedByChord >= -5
        var enharmRender = (note: Note) => {
            if (isFlat) {
                var x = note.getAbstract().enharmonicEquivalent()
                if (x.length == 1) {
                    return x.toLocaleUpperCase()
                }
                return x[0].toLocaleUpperCase() + x[1]
            } else {
                return note.getAbstract().string().toLocaleUpperCase()
            }
        }

        // Stuff to handle the slash root note
        var inversionSymbol = ""
        if (this.lowest().getAbstract().string() != this.root.getAbstract().string()) {
            inversionSymbol = "/"+ enharmRender(this.lowest())
        }

        return enharmRender(this.root) + this.symbol + inversionSymbol
    }
}

const sharps: Map<string, number> = new Map([
    ["c#", -5],
    ["g#", -4],
    ["d#", -3],
    ["a#", -2],
    ["f", -1],
    ["c", 0],
    ["g", 1],
    ["d", 2],
    ["a", 3],
    ["e", 4],
    ["b", 5],
    ["f#", 6],
])