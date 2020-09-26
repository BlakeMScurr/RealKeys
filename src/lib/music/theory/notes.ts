// Abstract notes like B and F# don't depend on octaves
export class AbstractNote {
    letter: string;
    accidental: boolean; // We only handle accidentals in fundamental representation, enharmonic flats are a rendering issue
    constructor(name: string) {
        if (name.length == 0 || name.length > 2) {
            throw "invalid note name length " + name.length + " for note " + name
        }

        var validNote = new RegExp(/[a-gA-GX]/)
        this.letter = name[0]
        if (!validNote.test(this.letter)) {
            throw "note letter must be between \"a\" and \"g\", got " + this.letter
        }

        if (name.length == 2 && name[1] != "#") {
            throw "only sharps are valid accidentals, got " + name[1] + " from " + name
        }

        this.accidental = name.length == 2
    }
    
    string() {
        var str = this.letter
        if (this.accidental) {
            str += "#"
        }
        return str
    }

    enharmonicEquivalent() {
        if (!this.accidental) {
            return this.string()
        }

        return NoteOrder[(NoteOrder.indexOf(this)+1)%12].letter + "b"
    }

    next() {
        var i = NoteOrder.indexOf(this)
        var n = NoteOrder[(i+1)%12];
        return n
    }

    nextLowest() {
        var i = NoteOrder.indexOf(this)
        var n = NoteOrder[(i-1+12)%12];
        return n
    }

    equals(note: AbstractNote) {
        return this.letter == note.letter && this.accidental == note.accidental
    }

    color() {
        return this.accidental ? "black" : "white"
    }
}

export function NewAbstractNote(name: string) {
    name = name.toLocaleLowerCase()
    for (var i = 0; i < NoteOrder.length; i++ ) {
        var note = NoteOrder[i]
        if (note.string() == name) {
            return note
        }

        if (note.enharmonicEquivalent() == name) {
            return note
        }
    }

    // Placeholder note/key
    // TODO: factor out
    if (name == "X") {
        return new AbstractNote("X")
    }
}

export class Note {
    abstract: AbstractNote;
    octave: number;

    // TODO: parseNot function that accepts a nice string
	constructor(note: AbstractNote, octave: number) {
        this.abstract = note
        this.octave = octave
    }
    
    lowerThan(note: Note) {
        if (this.octave < note.octave) {
            return true
        } else if (this.octave > note.octave) {
            return false
        }

        if (NoteOrder.indexOf(this.abstract) == -1){
            throw "can't find this abstract note " + this.abstract.string()
        }

        if(NoteOrder.indexOf(note.abstract) == -1) {
            throw "can't find that abstract note " + note.abstract.string()
        }
        return NoteOrder.indexOf(this.abstract) < NoteOrder.indexOf(note.abstract)
    }

    next() {
        var octave = this.octave
        if (NoteOrder.indexOf(this.abstract) == 11) {
            octave++
        }
        return new Note(this.abstract.next(), octave)
    }

    nextLowest() {
        var octave = this.octave
        if (NoteOrder.indexOf(this.abstract) == 0) {
            octave--
        }
        return new Note(this.abstract.nextLowest(), octave)
    }

    string() {
        return this.abstract.string() + this.octave
    }

    equals(note: Note) {
        return this.octave == note.octave && this.abstract.equals(note.abstract)
    }

    deepCopy():Note {
        // Deep copy is not full, since there should only be a single representation of each abstract note
        // TODO: change that
        return new Note(this.abstract, this.octave)
    }

    color():string {
        return this.abstract.color()
    }

    // TODO: efficiency - we should be able to do this without iteration with just a lookup
    intervalTo(note: Note) {
        let lower = NewNote(this.abstract.string(), this.octave)
        let higher = note
        let flip = 1
        if (higher.lowerThan(lower)) {
            let tmp = lower
            lower = higher
            higher = tmp
            flip = -1
        }

        let interval = 0
        while (!lower.equals(higher)) {
            lower = lower.next()
            interval++
        }

        return interval * flip
    }
}

export function NewNote(note: string, octave: number) {
    var an = NewAbstractNote(note);
    return new Note((an), octave)
}

// TODO: unexport
const notelist = ["c","c#","d","d#","e","f","f#","g","g#","a","a#","b"]
export const NoteOrder = notelist.map((name: string)=>{return new AbstractNote(name)})

// gives the ranges of notes between the two given, inclusive
export function notesBetween(low: Note, high: Note):Array<Note> {
    if (high.lowerThan(low)) {
        throw new Error("Highest note lower than lowest note")
    }

    let notes: Array<Note> = [];
    let curr = low
    while (!curr.equals(high)) {
        notes.push(curr)
        curr = curr.next()
    }
    notes.push(curr)

    return notes
}

// A line is a linear sequence of notes
export class Line {
    notes: Array<Note>;
    constructor(notes: Array<Note>) {
        this.notes = notes;
    }

    lowest():Note{
        return this.notes[0]
    }

    highest():Note{
        return this.notes[this.notes.length-1]
    }

    black():Array<Note> {
        return this.notes.filter((note)=>{
            return note.color() == "black"
        })
    }

    white():Array<Note> {
        return this.notes.filter((note)=>{
            return note.color() == "white"
        })
    }

    // gives a new map from all the notes in this line to a boolean representing whether they're active or note
    activeMap():Map<String, Boolean> {
        let m: Map<String, Boolean> = new Map()
        this.notes.forEach(note => {
            m.set(note.string(), false)
        });
        return m
    }
}