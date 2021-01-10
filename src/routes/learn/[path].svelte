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
    import { GameMaster } from '../../stores/stores'
    import { InertTrack, NewInstrument, newPiano } from '../../lib/track/instrument';
    import { Colourer } from '../../components/colours';
    import Loader from '../../components/loader/Loader.svelte'

    export let path;

    let gm = new GameMaster()
    let piano
    let loading = true

    let lesson

    async function getMidi(url) {
        window.AudioContext = window.AudioContext || window.webkitAudioContext;

        let midi
        try {
            midi = await Midi.fromUrl(url)
        } catch (e) {
            console.error(e)
            return
        }
        return midi
    }

    async function processMidiFile(midiPromise, songName) {
        let midi = await midiPromise

        let tracks = midi.tracks.filter((track)=>{
            return track.notes.length > 0
        })

        loading = true
        const toLoad = tracks.length + 1
        let numLoaded = 0
        let instrumentLoaded = (message) => {
            return (loaded) => {
                // console.log(message, loaded)
                numLoaded++
                if (numLoaded >= toLoad) {
                    loading = false
                }
            }
        }

        // TODO: allow one to use the same MIDI instrument as the track being played against
        piano = newPiano("Player Piano", instrumentLoaded("User piano loaded"))

        let duration = midi.duration
        gm.songDuration.set(duration*1000)

        let trackMap = new Map()
        tracks.forEach((track, i) => {
            let notes = new Array<TimedNote>();
            track.notes.forEach(note => {
                notes.push(new TimedNote(note.time / duration, (note.time + note.duration)/duration, NoteFromMidiNumber(note.midi), note.velocity))
            })

            trackMap.set(uniqueKey(trackMap, track.instrument.name), new InertTrack(new TimedNotes(notes), 
                NewInstrument(
                    track.instrument.number,
                    track.name,
                    track.instrument.percussion,
                    instrumentLoaded(`MIDI instrument (percussion: ${track.instrument.percussion})`), // TODO: investigate unexpectedly failing instrument loads
                    notes.map((tn)=>{return tn.note})),
            ))
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

        lesson = {tracks: trackMap, lessonID: songName, bars: bars, timeSignatures: midi.header.timeSignatures}
 
        return 
    }

    gm.audioReady.ready()

    function loadLocal(newpath) {
        gm.playingStore.pause()
        gm.seek.set(0)
        gm.tracks.clearAll()
        midiPromise = processMidiFile(getMidi(URL.createObjectURL(newpath)), newpath.name)
    }

    function loadNew(newpath) {
        gm.playingStore.pause()
        gm.seek.set(0)
        gm.tracks.clearAll()
        path = newpath
        goto("learn/" + newpath)
        midiPromise = processMidiFile(getMidi("api/midi?path=" + path), midiPathToName(path))
    }
    
    let midiPromise = processMidiFile(getMidi("api/midi?path=" + path), midiPathToName(path))

    function refreshMessage() {
        return new Promise(resolve => setTimeout(() => resolve("try refreshing"), 3000));
    }
</script>

<style lang="scss">
    .loading {
        position: absolute;
        z-index: 15;
        top: 50%;
        left: 50%;
    }
</style>

{#await midiPromise}
    <h1>Loading</h1>
    {#await refreshMessage() then message}
        <p>{message}</p>
    {/await}
{:then x}
    <Lesson owner={lesson.artist} lessonID={lesson.lessonID} timesignatures={lesson.timeSignatures} bars={lesson.bars} inertTracks={lesson.tracks} {gm} colourer={new Colourer(lesson.tracks.size)} {loadNew} {loadLocal} {piano}></Lesson>
    {#if loading}
        <div class="loading">
            <Loader></Loader>
        </div>
    {/if}
{:catch error}
    <h1>Could not load lesson {console.error(error)}</h1>
{/await}