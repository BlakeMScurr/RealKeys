import { NewNote, Note } from "./music/theory/notes";
import { scale } from "./music/theory/scales";

export const historyKey = "historyKey"

export class level {
    key: string;
    tonality: string;
    phraseLength: number;
    notePoolSize: number;
    maxInterval: number;

    // calculated, not part of the definition
    scale: scale;
    notes: Array<Note>;

    constructor(key: string, tonality: string, phraseLength: number, notePoolSize: number, maxInterval: number) {
        this.key = key
        this.tonality = tonality
        this.phraseLength = phraseLength
        this.notePoolSize = notePoolSize
        this.maxInterval = maxInterval

        this.scale = new scale(NewNote(key, 4), tonality)
        let notes = nNoteScale(this.scale.notes, notePoolSize)
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

    playURL():string {
        return "play?key=" + this.key + "&tonality=" + this.tonality + "&phraseLength=" + this.phraseLength + "&notePoolSize=" + this.notePoolSize + "&maxInterval=" + this.maxInterval
    }

    longerPhrases():level {
        return new level(this.key, this.tonality, this.phraseLength + 1, this.notePoolSize, this.maxInterval)
    }

    shorterPhrases():level {
        return new level(this.key, this.tonality, this.phraseLength - 1, this.notePoolSize, this.maxInterval)
    }
    moreNotes():level {
        return new level(this.key, this.tonality, this.phraseLength, this.notePoolSize + 1, this.maxInterval)
    }

    fewerNotes():level {
        return new level(this.key, this.tonality, this.phraseLength, this.notePoolSize - 1, this.maxInterval)
    }

    longerIntervals():level {
        return new level(this.key, this.tonality, this.phraseLength, this.notePoolSize, this.maxInterval + 1)
    }

    shorterIntervals():level {
        return new level(this.key, this.tonality, this.phraseLength + 1, this.notePoolSize, this.maxInterval - 1)
    }

    succeed() {
        let history = localStorage.getItem(historyKey)
        if (!history) {
            localStorage.setItem(historyKey, JSON.stringify({
                levels: [
                    this.definition(),
                ],
            }))
        } else {
            let parsedHistory = JSON.parse(history)
            parsedHistory.levels.push(this.definition())
            localStorage.setItem(historyKey, JSON.stringify(parsedHistory))
        }
    }

    definition() {
        return {
            key: this.key,
            tonality: this.tonality,
            phraseLength: this.phraseLength,
            notePoolSize: this.notePoolSize,
            maxInterval: this.maxInterval,
            time: new Date(),
        }
    }
}

function nNoteScale(scale: Array<Note>, n: number):Array<Note> {
    let notes = new Array<Note>();
    let i = 0
    while (i < n) {
        let noteIndex = i % scale.length
        let octave = Math.floor(i / scale.length)
        notes.push(scale[noteIndex].jump(12 * octave))
        i++
    }
    return notes
}

export function levelFromURL(query):level {
    return new level(query.key, query.tonality, parseInt(query.phraseLength), parseInt(query.notePoolSize), parseInt(query.maxInterval))
}