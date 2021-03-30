export class level {
    key: string;
    tonality: string;
    phraseLength: number;
    notePoolSize: number;
    maxInterval: number;

    constructor(key: string, tonality: string, phraseLength: number, notePoolSize: number, maxInterval: number) {
        this.key = key
        this.tonality = tonality
        this.phraseLength = phraseLength
        this.notePoolSize = notePoolSize
        this.maxInterval = maxInterval
    }
}

export function levelFromURL(query):level {
    return new level(query.key, query.tonality, query.phraseLength, query.notePoolSize, query.maxInterval)
}