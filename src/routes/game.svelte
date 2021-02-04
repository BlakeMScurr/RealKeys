<script lang="ts">
    import { stores } from "@sapper/app";
    import { onMount } from "svelte";
    import { lessons } from "../lib/lesson/data";
    import { speed, urlToTask } from "../lib/lesson/lesson";
    import { NewNote, notesBetween } from "../lib/music/theory/notes";
    import { newPiano } from "../lib/track/instrument";
    import { Colourer } from "../components/colours";
    import { getMIDI } from "../lib/midi";
    import type { TimedNotes } from "../lib/music/timed/timed";
    import Piano from "../components/pianoroll/piano/Piano.svelte";
    import Loader from "../components/loader/Loader.svelte";
    import Rules from "../components/Rules.svelte";
    import Game from "../components/Game.svelte";
    import { GameMaster } from "../stores/stores";
    import { timedScoreKeeper, untimedScoreKeeper } from "../lib/lesson/score";
    import { handleNotes, nextWaitModeNote } from "../stores/waitMode";
    import { writable } from "svelte/store";
    import { get } from "../lib/util";
    import { goto } from '@sapper/app'

    const { page } = stores();
    const query = $page.query;
    let task = urlToTask(query)

    if (!lessons.has(task.lesson)) {
        throw new Error(`No lesson called ${task.lesson}`)
    }

    // required as trying to creating instruments requires window.AudioContext, and errors in preprocessing on the server
    let piano
    let loading = true
    onMount(() => {
        piano = newPiano("User Piano", ()=>{loading = false})
    })

    let tracks = new Map<string, TimedNotes>();
    let colourer = new Colourer(3)
    let duration = 10000
    let position
    let nextable = false
    let sandbox = true
    let scorer
    scorer = new timedScoreKeeper(new GameMaster().position)

    let onNext = () => {}
    let started = false
    function handleNext() {
        started = true
        onNext()
        sandbox = false
    }
    let handlePlayingNotes = (e: Event) => {}

    let lessonNotes
    getMIDI("api/midi?path=%2FTutorials/" + task.lesson + ".mid").then((midi)=>{
        tracks = midi.tracks
        duration = midi.duration
        colourer = new Colourer(tracks.size)
        let gm = new GameMaster()
        gm.duration.set(duration)
        gm.position.subscribe((pos)=>{
            position = pos
            if (pos >= 1) {
                task.score = scorer.validRatio() * 100
                goto("score?" + task.queryString())
            }
        })
        tracks.forEach((notes, name) => {
            gm.tracks.newPlaybackTrack(name, notes, newPiano(name, ()=>{console.log(`piano ${name} loaded`)}), gm)
        })
        onNext = () => { gm.play.play() }
        nextable = true
        scorer = new timedScoreKeeper(gm.position)

        switch (task.speed) {
            case speed.OwnPace:
                gm.waitMode.set(true)
                onNext = () => {
                    //subscribe to the notes needed to progress
                    let stateSetter = writable(new Map<string, string>());
                    function onNoteStateChange(notes: Map<string, string>) {
                        let state = get(stateSetter)
                        notes.forEach((noteState, noteName: string)=>{
                            state.set(noteName, noteState)
                        })
                        stateSetter.set(state)
                    }

                    gm.seek.subscribe(() => {
                        let state = get(stateSetter)
                        nextWaitModeNote(gm, tracks).sameStart.forEach(note => {
                            state.set(note.note.string(), "expecting")
                        })
                        stateSetter.set(state)
                    })

                    gm.tracks.subscribeToNotesOfTracks(Array.from(tracks.keys()), onNoteStateChange)

                    stateSetter.subscribe((notes) => {
                        lessonNotes = notes
                    })

                    // hook up the notes played
                    handlePlayingNotes = handleNotes(gm, stateSetter, tracks)
                }
                gm.tracks.enable(Array.from(tracks.keys()))
                gm.seek.set(0)
                scorer = new untimedScoreKeeper()

                break;
            case speed.Fifty:
                gm.speed.set(0.5)
                gm.tracks.subscribeToNotesOfTracks(Array.from(tracks.keys()), (notes) => {lessonNotes = notes})
                break;
            case speed.SeventyFive:
                gm.speed.set(0.75)
                gm.tracks.subscribeToNotesOfTracks(Array.from(tracks.keys()), (notes) => {lessonNotes = notes})
                break;
            case speed.OneHundred:
                gm.speed.set(1)
                gm.tracks.subscribeToNotesOfTracks(Array.from(tracks.keys()), (notes) => {lessonNotes = notes})
                break;
        }
    }).catch((e)=>{
        throw new Error(e)
    })
</script>

<style lang="scss">
    .centerer {
        height: calc(100% - 50px); // whole page - nav

        .nonpiano {
            height: 67%;
        }
        .piano {
            position: relative;
            flex-grow: 1;
            width: 100%;
            height: 33%
        }
    }

    .loading {
        position: absolute;
        z-index: 15;
        height: 0;
        top: calc(50% - 75px); // centred, given ~150 width loading icon
        left: calc(50% - 75px);
    }

</style>

<div class="centerer">
    <div class="nonpiano">
        {#if !started}
            <Rules {task} on:next={handleNext} {nextable}></Rules>
        {:else}
            <Game {task} {tracks} {colourer} {duration} {position} {scorer}></Game>
        {/if}
    </div>

    <div class="piano">
        <Piano keys={ notesBetween(NewNote("C", 4), NewNote("C", 5)) } {sandbox} instrument={piano} {lessonNotes} {position} {scorer} on:playingNotes={handlePlayingNotes}></Piano>
        {#if loading}
            <div class="loading">
                <Loader></Loader>
            </div>
        {/if}
    </div>
</div>
