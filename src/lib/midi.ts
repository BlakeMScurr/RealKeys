import { Midi } from '@tonejs/midi'
import { NoteFromMidiNumber } from './music/theory/notes';
import { TimedNote, TimedNotes } from './music/timed/timed';
import { uniqueKey } from './util'
import { Bars } from '../components/pianoroll/pianoRollHelpers';
import { InertTrack, NewInstrument, newPiano } from './track/instrument';

export async function getMIDI(url) {
    window.AudioContext = window.AudioContext || window.webkitAudioContext;

    let midi
    try {
        midi = await Midi.fromUrl(url)
    } catch (e) {
        console.error(e)
        return
    }

    let tracks = midi.tracks.filter((track)=>{
        return track.notes.length > 0
    })

    let loading = true
    const toLoad = tracks.length + 1
    let numLoaded = 0
    let instrumentLoaded = (message) => {
        return (loaded) => {
            if (loaded) {
                numLoaded++
                console.log(message)
                if (numLoaded >= toLoad) {
                    loading = false
                }
            }
        }
    }

    let duration = midi.duration

    let trackMap = new Map()
    let instrumentMap = new Map()
    tracks.forEach((track) => {
        let notes = new Array<TimedNote>();
        track.notes.forEach(note => {
            notes.push(new TimedNote(note.time / duration, (note.time + note.duration)/duration, NoteFromMidiNumber(note.midi), note.velocity))
        })

        let key = uniqueKey(trackMap, track.instrument.name)

        trackMap.set(key, new TimedNotes(notes))
        instrumentMap.set(key,
            NewInstrument(
                track.instrument.number,
                track.name,
                track.instrument.percussion,
                instrumentLoaded(`MIDI instrument (percussion: ${track.instrument.percussion})`), // TODO: investigate unexpectedly failing instrument loads
                notes.map((tn)=>{return tn.note}),
            ),
        )
    })

    return {tracks: trackMap, instruments: instrumentMap, duration: duration*1000}
}