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

    prettyString() {
        var str = this.letter
        if (this.accidental) {
            switch (str) {
                case "d":
                    return "Eb"
                case "a":
                    return "Bb"
                default:
                    str += "#"
            }
        }
        return str.toLocaleUpperCase()
    }

    enharmonicEquivalent() {
        if (!this.accidental) {
            return this.string().toUpperCase()
        }

        return NoteOrder[(NoteOrder.indexOf(this)+1)%12].letter.toLocaleUpperCase() + "b"
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

export function NewAbstractNote(name: string):AbstractNote {
    let n = name.toLocaleLowerCase()
    if (noteMap.has(n)) {
        return NoteOrder[noteMap.get(n)!]
    } else if (enharmonicNoteMap.has(n)) {
        return NoteOrder[enharmonicNoteMap.get(n)!]
    }

    throw new Error("note " + name + " is not a valid note")
}

export interface Note {
    lowerThan(note: Note):boolean
    next():Note
    nextLowest():Note
    string():string
    enharmonicEquivalent():string
    equals(note: Note):boolean
    deepCopy():Note
    color():string
    intervalTo(note: Note):number
    jump(semitones: number):Note
    midiNumber():number
    getOctave():number
    getAbstract():AbstractNote
    discriminator():string
}

const noteTypeDiscriminator = "I'm a real Note!"
export function InstanceOfNote(noteCandidate: any):boolean {
    return noteCandidate.discriminator && noteCandidate.discriminator() === noteTypeDiscriminator
}

class NoteImplementation {
    abstract: AbstractNote;
    octave: number;

    // TODO: parseNote function that accepts a nice string
	constructor(note: AbstractNote, octave: number) {
        this.abstract = note
        this.octave = octave
    }

    // TODO: this seems like a horrible hack, has typescript introduced interface assertion yet? This is supposedly the way to do it. From https://stackoverflow.com/a/14426274
    discriminator():string {
        return noteTypeDiscriminator
    }

    getOctave():number {
        return this.octave
    }

    getAbstract():AbstractNote {
        return this.abstract
    }
    
    lowerThan(note: Note):boolean {
        if (this.getOctave() < note.getOctave()) {
            return true
        } else if (this.getOctave() > note.getOctave()) {
            return false
        }

        if (NoteOrder.indexOf(this.getAbstract()) == -1){
            throw "can't find this abstract note " + this.getAbstract().string()
        }

        if(NoteOrder.indexOf(note.getAbstract()) == -1) {
            throw "can't find that abstract note " + note.getAbstract().string()
        }
        return NoteOrder.indexOf(this.getAbstract()) < NoteOrder.indexOf(note.getAbstract())
    }

    next():Note {
        var octave = this.getOctave()
        if (NoteOrder.indexOf(this.getAbstract()) == 11) {
            octave++
        }
        return NewNote(this.getAbstract().next().string(), octave)
    }

    nextLowest() {
        var octave = this.getOctave()
        if (NoteOrder.indexOf(this.getAbstract()) == 0) {
            octave--
        }
        return NewNote(this.getAbstract().nextLowest().string(), octave)
    }

    string() {
        return this.getAbstract().string() + this.getOctave()
    }

    enharmonicEquivalent():string {
        return this.getAbstract().enharmonicEquivalent() + this.getOctave()
    }

    equals(note: Note) {
        return this.getOctave() == note.getOctave() && this.getAbstract().equals(note.getAbstract())
    }

    deepCopy():Note {
        // Deep copy is not full, since there should only be a single representation of each abstract note
        // TODO: change that
        return NewNote(this.getAbstract().string(), this.getOctave())
    }

    color():string {
        return this.getAbstract().color()
    }

    intervalTo(note: Note):number {
        let octaveDiff = note.getOctave() - this.getOctave()
        let noteDiff = notelist.indexOf(note.getAbstract().string()) - notelist.indexOf(this.getAbstract().string())

        return octaveDiff * 12 + noteDiff
    }

    jump(semitones: number):Note {
        let octaveDiff = Math.trunc(semitones / 12)
        let noteDiff = semitones % 12
        let index = notelist.indexOf(this.getAbstract().string()) + noteDiff
        if (index < 0) {
            octaveDiff--
            index += 12
        }
        if (index > 11) {
            octaveDiff++
            index -= 12
        }
        return NewNote(NoteOrder[index].string(), this.getOctave() + octaveDiff)
    }

    // Opposite of NoteFromMidiNumber
    midiNumber():number{
        return (this.getOctave() + 1) * 12 + notelist.indexOf(this.getAbstract().string())
    }
}

// This forces all references to the same note to be equal, which means they behave well in maps etc
const noteHolder = new Map<string, Note>();
export function NewNote(pitchStr: string, octave: number):Note {
    const uniqueDef = pitchStr.toLocaleLowerCase() + octave

    if (!noteHolder.has(uniqueDef)) {
        noteHolder.set(uniqueDef, new NoteImplementation(NewAbstractNote(pitchStr), octave))
    }
    return noteHolder.get(uniqueDef)
}

// TODO: unexport
const notelist = ["c","c#","d","d#","e","f","f#","g","g#","a","a#","b"]
export const NoteOrder = notelist.map((name: string)=>{return new AbstractNote(name)})
const noteMap:Map<string, number> = new Map(notelist.map((note, i) => [note, i]))
const enharmonicNoteMap:Map<string, number> = new Map(notelist.map((name, i) => {
    return [NoteOrder[notelist.indexOf(name)].enharmonicEquivalent().toLocaleLowerCase(), i]
}))

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
    activeMap():Map<Note, boolean> {
        let m: Map<Note, boolean> = new Map()
        pianoNotes().forEach(note => {
            m.set(note, false)
        });
        return m
    }
}

export function NoteFromMidiNumber(num: number):Note {
    let octave = Math.trunc(num / 12) - 1;
    let noteIndex = (num % 12);
    return NewNote(NoteOrder[noteIndex].string(), octave)
}

export const lowestPianoNote = NewNote("A", 0)
export const highestPianoNote = NewNote("C", 8)

export function pianoNotes ():Array<Note> {
    return noteRange(lowestPianoNote, highestPianoNote)
}

export function noteRange(a: Note, b: Note):Array<Note> {
    let notes: Array<Note> = []
    while (a.lowerThan(b)) {
        notes.push(a)
        a = a.next()
    }
    notes.push(a)
    return notes
}

// TODO: consider whether this is necessary or desirable
export function parseNoteString(s: string):Note {
    let matches = s.match(/(.*)(\d+)/)
    return NewNote(matches[1], parseInt(matches[2]))
}