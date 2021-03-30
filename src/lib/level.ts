import { NewNote, Note } from "./music/theory/notes";
import { scale } from "./music/theory/scales";

export class level {
    key: string;
    tonality: string;
    phraseLength: number;
    notePoolSize: number;
    maxInterval: number;

    // calculated, not part of the definition
    private scale: scale;
    private notes: Array<Note>;

    constructor(key: string, tonality: string, phraseLength: number, notePoolSize: number, maxInterval: number) {
        this.key = key
        this.tonality = tonality
        this.phraseLength = phraseLength
        this.notePoolSize = notePoolSize
        this.maxInterval = maxInterval

        this.scale = new scale(NewNote(key, 4), tonality)
        let notes = this.scale.notes.slice()
        notes.splice(notePoolSize)
        this.notes = notes
    }

    newPhrase():Array<Note> {
        let phrase = [this.notes[0]] // a phrase always starts on teh root to contextualise the phrase for listeners without perfect pitch
        let jump = this.maxInterval
        let i = this.phraseLength - 1
        while (i > 0) {
            let previousNote = phrase[phrase.length-1]
            let prevIndex = this.notes.lastIndexOf(previousNote)
            if (prevIndex === -1) {
                throw new Error(`Couldn't find previous note ${previousNote.string()}`)
            }
            let validNotes = this.notes.filter((_, index) => {
                return prevIndex - jump < index && index < prevIndex + jump
            })
            
            let randomIndex = Math.floor(Math.random() * validNotes.length)
            let randomNote = validNotes[randomIndex]
            phrase.push(randomNote)
            i--
        }
        return phrase
    }
}

export function levelFromURL(query):level {
    return new level(query.key, query.tonality, parseInt(query.phraseLength), parseInt(query.notePoolSize), parseInt(query.maxInterval))
}