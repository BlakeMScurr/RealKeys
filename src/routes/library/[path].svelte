<script context="module">
	export function preload(page) {
		return { 
            path: page.params.path,
        }
	}
</script>

<script lang="ts">
    import { onMount } from 'svelte';
    import { goto } from '@sapper/app'
    import { Midi } from '@tonejs/midi'
    import { NoteFromMidiNumber } from '../../lib/music/theory/notes';
    import { TimedNote, TimedNotes } from '../../lib/music/timed/timed';
    import { disableGlobalKeys, enableGlobalKeys, uniqueKey } from '../../lib/util'
    import { Bars } from '../../components/pianoroll/pianoRollHelpers';
    import Lesson from '../../components/lesson/Lesson.svelte'
    import { audioReady, playingStore, songDuration } from '../../stores/stores'
    import { InertTrack, NewInstrument } from '../../components/track/instrument';

    export let path;

    const separator = "%2F" // this is an alternative to / that doesn't exist in any of the paths in the midi library and shows up in the url

    async function processMidiFile() {
        window.AudioContext = window.AudioContext || window.webkitAudioContext;

        const midi = await Midi.fromUrl("api/midi?path=" + path)
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

        return {tracks: trackMap, artist: artist, lessonID: songName, bars: bars, timeSignatures: midi.header.timeSignatures}
    }

    audioReady.ready()

    let searchQuery: string;
    let searchResults: Array<{path: string, name: string}> = [];

    // Search as the search query updates
    let f
    onMount(()=>{
        f = fetch
    })

    $: {
        search(searchQuery)
    }

    let searchTimeout: ReturnType<typeof setTimeout>;
    function search(searchQuery) {
        if (f !== undefined) {
            clearTimeout(searchTimeout)
            searchTimeout = setTimeout(()=> {
                // Delay the search so that we don't hit the server too hard and have to wait too long for the most recent result we're actually interested in
                // TODO: try cancelling requests per https://stackoverflow.com/questions/31061838/how-do-i-cancel-an-http-fetch-request
                let req = {
                    method: 'get',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }
                fetch("api/search?searchQuery=" + searchQuery, req).then((res) => {
                    return res.json()
                }).then((json) => {
                    searchResults = JSON.parse(json).map((item) => {return item.item})
                    console.log("got result for", searchQuery)
                })
            }, 200)
        }
    }

    
    let midiPromise = processMidiFile()
    function loadNew(newpath) {
        playingStore.pause()
        goto("library/" + newpath)
        path = newpath
        midiPromise = processMidiFile()
        searchResults = []
    }
</script>
<input type="text" bind:value={searchQuery} on:focus={disableGlobalKeys} on:focusout={enableGlobalKeys}>
{#each searchResults as result}
    <div on:click={() => {loadNew(result.path.replace(/\//g, separator))}}> 
        <p>{result.name}</p>
    </div>
{/each}

{#await midiPromise}
    <h1>Loading</h1>
{:then lesson}
<Lesson owner={lesson.artist} lessonID={lesson.lessonID} timesignatures={lesson.timeSignatures} bars={lesson.bars} tracks={lesson.tracks} artist={lesson.artist} spotify_id={""} gl={true}></Lesson>
{:catch error}
    <h1>Could not load lesson {console.log(error)}</h1>
{/await}