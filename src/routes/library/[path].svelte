<script context="module">
	export function preload(page) {
		return { 
            path: page.params.path,
        }
	}
</script>

<script lang="ts">
    import { goto } from '@sapper/app'
    import { Midi } from '@tonejs/midi'
    import { NoteFromMidiNumber } from '../../lib/music/theory/notes';
    import { TimedNote, TimedNotes } from '../../lib/music/timed/timed';
    import { uniqueKey, midiPathToName } from '../../lib/util'
    import { Bars } from '../../components/pianoroll/pianoRollHelpers';
    import Lesson from '../../components/lesson/Lesson.svelte'
    import { audioReady, playingStore, songDuration, tracks, seek } from '../../stores/stores'
    import { InertTrack, NewInstrument } from '../../lib/track/instrument';
    import Navbar from '../../components/PageAreas/Navbar.svelte';

    export let path;

    let lesson
    async function processMidiFile() {
        window.AudioContext = window.AudioContext || window.webkitAudioContext;

        const midi = await Midi.fromUrl("api/midi?path=" + path)
        let songName = midiPathToName(path)

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

            trackMap.set(uniqueKey(trackMap, track.instrument.name), new InertTrack(new TimedNotes(notes), NewInstrument(track.instrument.number, track.name, track.instrument.percussion, notes.map((tn)=>{return tn.note}))))
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

        console.log("setting lesson")
        lesson = {tracks: trackMap, artist: "", lessonID: songName, bars: bars, timeSignatures: midi.header.timeSignatures}
        return 
    }

    audioReady.ready()

    function loadNew(newpath) {
        playingStore.pause()
        seek.set(0)
        tracks.clearAll()
        goto("library/" + newpath)
        path = newpath
        midiPromise = processMidiFile()
    }
    
    let midiPromise = processMidiFile()

    function refreshMessage() {
        return new Promise(resolve => setTimeout(() => resolve("try refreshing"), 3000));
    }
</script>

<Navbar {loadNew}></Navbar>

{#await midiPromise}
    <h1>Loading</h1>
    {#await refreshMessage() then message}
        <p>{message}</p>
    {/await}
{:then x}
    <Lesson owner={lesson.artist} lessonID={lesson.lessonID} timesignatures={lesson.timeSignatures} bars={lesson.bars} tracks={lesson.tracks} artist={lesson.artist} spotify_id={""} gl={true}></Lesson>
{:catch error}
    <h1>Could not load lesson {console.log(error)}</h1>
{/await}