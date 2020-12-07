<script context="module">
	export function preload(page) {
		return { 
            path: page.params.path,
        }
	}
</script>

<script lang="ts">
    import { Midi } from '@tonejs/midi'
    import { NoteFromMidiNumber } from '../../lib/music/theory/notes';
    import { TimedNote, TimedNotes } from '../../lib/music/timed/timed';
    import { uniqueKey } from '../../lib/util'
    import { Bars } from '../../components/pianoroll/pianoroll.ts';
    import Lesson from '../../components/lesson/Lesson.svelte'
    import { audioReady, songDuration } from '../../stores/stores'
    import { InertTrack, NewInstrument } from '../../components/track/instrument';

    export let path;

    const separator = "%2F" // this is an alternative to / that doesn't exist in any of the paths in the midi library and shows up in the url

    console.log("path", path)

    async function processMidiFile() {
        window.AudioContext = window.AudioContext || window.webkitAudioContext;

        const midi = await Midi.fromUrl("api/midi?path=" + path)
        console.log(midi)
        //the file name decoded from the first track
        let nameparts = midi.name.split("@")
        let songName = nameparts[0]
        let artist = ""
        if (nameparts.length > 1) artist = nameparts[1]

        let duration = midi.duration
        songDuration.set(duration*1000)

        let trackMap = new Map()
        midi.tracks.filter((track)=>{
            return track.notes.length > 0
        }).forEach((track, i) => {
            let notes = new Array<TimedNote>();
            track.notes.forEach(note => {
                notes.push(new TimedNote(note.time / duration, (note.time + note.duration)/duration, NoteFromMidiNumber(note.midi)))
            })

            trackMap.set(uniqueKey(trackMap, track.instrument.name), new InertTrack(new TimedNotes(notes), NewInstrument(track.instrument.number, track.name, track.instrument.percussion)))
        })

        let bs = []
        // TODO: show bar division as well as beats
        // TODO: handle multiple time signatures
        let tempo = midi.header.tempos[0].bpm
        let x = 0
        while (x < duration) {
            bs.push(60/tempo)
            x += 60/tempo
        }
        let bars = new Bars(bs.map(b=>{return b/duration}))
        console.log("tempo", tempo, "duration", duration, "first bar length", bars.bars[0], "bars", bars)

        return {tracks: trackMap, artist: artist, lessonID: songName, bars: bars, timeSignatures: midi.header.timeSignatures}
    }

    processMidiFile()
    audioReady.ready()
</script>



{#await processMidiFile()}
    <h1>Loading</h1>
{:then lesson}
<Lesson owner={lesson.artist} lessonID={lesson.lessonID} timesignatures={lesson.timeSignatures} bars={lesson.bars} tracks={lesson.tracks} artist={lesson.artist} spotify_id={""} gl={true}></Lesson>
{:catch error}
    <h1>Could not load lesson {console.log(error)}</h1>
{/await}