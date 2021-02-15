import { Midi } from '@tonejs/midi'
import { NoteFromMidiNumber } from './music/theory/notes';
import { TimedNote, TimedNotes } from './music/timed/timed';
import { uniqueKey } from './util'
import { NewInstrument } from './track/instrument';

export async function getMIDI(url, startbar: number, endbar: number) {
    let midi
    try {
        midi = await Midi.fromUrl(url)
    } catch (e) {
        console.error(e)
        return
    }

    let bpm = midi.header.tempos[0].bpm
    let bpb = midi.header.timeSignatures[0].timeSignature[0]
    let timePerBar = (1/bpm) * bpb * 60
    let startTime = timePerBar * (startbar - 1)
    let endTime = timePerBar * (endbar - 1)

    let tracks = midi.tracks.filter((track)=>{
        return track.notes.length > 0
    })

    let duration = endTime - startTime

    let highest = NoteFromMidiNumber(tracks[0].notes[0].midi)
    let lowest = highest

    let trackMap = new Map()
    let instrumentMap = new Map()
    tracks.forEach((track) => {
        let notes = new Array<TimedNote>();
        track.notes.forEach(note => {
            let rkNote = NoteFromMidiNumber(note.midi)
            if (note.time >= startTime && note.time < endTime) {
                notes.push(new TimedNote((note.time - startTime) / duration, ((note.time - startTime) + note.duration)/duration, rkNote, note.velocity))
            }
            if (rkNote.lowerThan(lowest)) {
                lowest = rkNote
            }
            if (highest.lowerThan(rkNote)) {
                highest = rkNote
            }
        })

        let key = uniqueKey(trackMap, track.instrument.name)

        trackMap.set(key, new TimedNotes(notes))
        instrumentMap.set(key,
            NewInstrument(
                track.instrument.number,
                track.name,
                track.instrument.percussion,
                ()=> {},
                notes.map((tn)=>{return tn.note}),
            ),
        )
    })

    return {tracks: trackMap, instruments: instrumentMap, duration: duration*1000, highest: highest, lowest: lowest}
}