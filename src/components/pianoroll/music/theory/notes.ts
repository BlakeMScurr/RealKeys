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
}

export function NewNote(note: string, octave: number) {
    var an = NewAbstractNote(note);
    return new Note((an), octave)
}

// TODO: unexport
const notelist = ["c","c#","d","d#","e","f","f#","g","g#","a","a#","b"]
export const NoteOrder = notelist.map((name: string)=>{return new AbstractNote(name)})

// A line is a linear sequence of notes
export class Line {
    notes: Array<Note>;
    constructor(notes: Array<Note>) {
        this.notes = notes;
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
}