import { NewNote } from "./music/theory/notes";
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
}

export function levelFromURL(query):level {
    return new level(query.key, query.tonality, query.phraseLength, query.notePoolSize, query.maxInterval)
}