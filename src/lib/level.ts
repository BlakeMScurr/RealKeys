import { NewNote, Note } from "./music/theory/notes";
import { scale } from "./music/theory/scales";

export class level {
    key: string;
    tonality: string;
    phraseLength: number;
    notePoolSize: number;
    maxInterval: number;
    scale: scale;

    constructor(key: string, tonality: string, phraseLength: number, notePoolSize: number, maxInterval: number) {
        this.key = key
        this.tonality = tonality
        this.phraseLength = phraseLength
        this.notePoolSize = notePoolSize
        this.maxInterval = maxInterval
        this.scale = new scale(NewNote(key, 4), tonality)
    }

    newPhrase():Array<Note> {
        let notes = [this.scale.notes[0]] // a phrase always starts on teh root to contextualise the phrase for listeners without perfect pitch
        let i = this.phraseLength - 1
        while (i > 0) {
            
            let randomNote = this.scale.notes[Math.floor(Math.random() * this.scale.notes.length)]
            notes.push()
            i--
        }
        return notes
    }
}

export function levelFromURL(query):level {
    return new level(query.key, query.tonality, query.phraseLength, query.notePoolSize, query.maxInterval)
}