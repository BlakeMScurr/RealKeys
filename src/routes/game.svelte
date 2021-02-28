<script lang="ts">
    import { stores } from "@sapper/app";
    import { onDestroy, onMount } from "svelte";
    import { fade } from 'svelte/transition';
    import { getSettings } from "../lib/storage";
    import { highestPianoNote, lowestPianoNote, NewNote, noteRange, notesBetween } from "../lib/music/theory/notes";
    import { newPiano } from "../lib/track/instrument";
    import type { VirtualInstrument } from "../lib/track/instrument";
    import { Colourer } from "../components/colours";
    import { getMIDI } from "../lib/midi";
    import type { TimedNotes, TimedNote } from "../lib/music/timed/timed";
    import type { Note } from "../lib/music/theory/notes";
    import Piano from "../components/pianoroll/piano/Piano.svelte";
    import Loader from "../components/loader/Loader.svelte";
    import Rules from "../components/Rules.svelte";
    import Game from "../components/Game.svelte";
    import { GameMaster } from "../stores/stores";
    import { timedScoreKeeper, untimedScoreKeeper } from "../lib/gameplay/score/score";
    import { handleNotes, nextWaitModeNote } from "../stores/waitMode";
    import { writable } from "svelte/store";
    import type { Readable } from "svelte/types/runtime/store"; // TODO: import this from "svelte/store", which works in .ts files not .svelte files
    import { get, handleErrors, OneTo100, objToURLArgs } from "../lib/util";
    import { goto } from '@sapper/app'
    import { range } from "../components/pianoroll/pianoRollHelpers";
    import { hand, task, urlToTask } from "../lib/gameplay/curriculum/task";
    import { getProgress } from "../lib/storage";
    import { modeName } from "../lib/gameplay/mode/mode";

    const { page, session } = stores();
    const query = $page.query;
    let currentTask: task = urlToTask(query)

    // TODO: there's so much state here it's disgusting, we neeeeed to tidy this up!!!
    // required as trying to creating instruments requires window.AudioContext, and errors in preprocessing on the server
    let piano;
    let loading = true
    let resizeTrigger = 0
    let screenWidth = 500
    let keyHeight = 120

    let tracks = new Map<string, TimedNotes>();
    let colourer = new Colourer(3)
    let duration = 10000
    let position
    let nextable = false
    let sandbox = true
    let scorer
    scorer = new timedScoreKeeper(new GameMaster().position)
    let lowest = NewNote("C", 4)
    let highest = NewNote("C", 5)

    let onNext = () => {}
    let started = false
    function handleNext() {
        started = true
        onNext()
        sandbox = false
    }
    let handlePlayingNotes = (e: Event) => {}

    let lessonNotes: Map<Note, string>;

    let cleanup = ()=>{}
    onDestroy(()=>{
        cleanup()
    })

    onMount(() => {
        // Setup input if it's not already set
        if (!getSettings()) {
            session.set({"redirect": $page.path + "?" + objToURLArgs($page.query)})
            goto("/settings")
        }

        handleErrors(window)
        // TODO: unlock iOS audio as per https://gist.github.com/laziel/7aefabe99ee57b16081c
        window.AudioContext = window.AudioContext || window["webkitAudioContext"] // TODO: move to some polyfill location which is guaranteed to be called before application code.


        piano = newPiano("User Piano", ()=>{loading = false})
        window.onresize = () => {
            resizeTrigger++
        }
        screenWidth = window.innerWidth
        keyHeight = (window.innerHeight - 50) / 3

        // TODO: get the midi from current session, and load it in lesson.svelte too
        getMIDI("api/midi?path=%2FTutorials/" + currentTask.lessonURL + ".mid", currentTask.startBar, currentTask.endBar).then((midi)=>{
            highest = midi.highest
            lowest = midi.lowest
            tracks = midi.tracks
            duration = midi.duration
            colourer = new Colourer(tracks.size)
            let gm = new GameMaster()
            gm.duration.set(duration)
            cleanup = gm.position.subscribe((pos)=>{
                position = pos
                if (pos >= 1) { // TODO: wait until the last note of the track is done instead
                    let score = OneTo100(scorer.validRatio() * 100)
                    getProgress().recordScore(currentTask, score)
                    goto("score?" + currentTask.queryString() + "&score=" + score)
                }
            })

            let rt = relevantTrack(tracks, currentTask)
    
            let trackInstrumentsLoaded = 0
            tracks.forEach((notes, name) => {
                let trackPiano = newPiano(name, ()=>{
                    trackInstrumentsLoaded++
                    if (trackInstrumentsLoaded === tracks.size) {
                        nextable = true
                    }
                })
                if (rt.includes(name)) {
                    trackPiano.setVolume(0)
                }
                gm.tracks.newPlaybackTrack(name, notes, trackPiano, gm)
            })
            onNext = () => { gm.play.play() }
            scorer = new timedScoreKeeper(gm.position)
            gm.seek.set(-2000/get(<Readable<number>>gm.duration)) // give space before the first note
    
            switch (currentTask.mode.modeType()) {
                case modeName.wait:
                    gm.seek.set(0) // TODO: go to the first note
                    gm.waitMode.set(true)
                    onNext = () => {
                        //subscribe to the notes needed to progress
                        let stateSetter = writable(new Map<Note, string>());
    
                        let activeTrack = mergeTracks(relevantTrack(tracks, currentTask), tracks)
                        gm.seek.subscribe(() => {
                            let state = new Map<Note, string>()
                            let nextState = nextWaitModeNote(gm, activeTrack)
                            nextState.sameStart.forEach(note => {
                                state.set(note.note, "expecting")
                            })
                            nextState.heldNotes.forEach((_, note) => {
                                state.set(note, "soft")
                            })
                            stateSetter.set(state)
                        })
    
                        stateSetter.subscribe((notes) => {
                            lessonNotes = notes
                        })
    
                        // hook up the notes played
                        handlePlayingNotes = handleNotes(gm, stateSetter, activeTrack)
                    }
                    gm.tracks.enable(rt)
                    gm.seek.set(0)
                    scorer = new untimedScoreKeeper()
    
                    break;
                case modeName.atSpeed:
                    gm.speed.set(currentTask.mode.getSpeed()/100)
                    gm.tracks.subscribeToNotesOfTracks(rt, (notes) => {
                        lessonNotes = notes
                    })
                    break;
            }
        }).catch((e)=>{
            throw new Error(e)
        })
    })

    function relevantTrack(tracks: Map<string, TimedNotes>, t: task):string[] {
        // assumes we have exactly 2 tracks, the first being the left hand, and the second being the right
        let arr = Array.from(tracks.keys())
        switch (t.hand) {
            case hand.Right:
                return [arr[0]]
            case hand.Left:
                return [arr[1]]
            case hand.Both:
                return arr
        }
    }

    function mergeTracks(relevant: Array<string>, all: Map<string, TimedNotes>):TimedNotes {
        if (relevant.length === 0) {
            throw new Error("There must be at least one active track")
        } else if (relevant.length === 1) {
            return all.get(relevant[0])
        } else if (relevant.length === 2) {
            let left = all.get(relevant[0]) // TODO: see if left and right apply correctly
            let right = all.get(relevant[1])

            // TODO: avoid side effects by deep copying
            left.notes.push(...right.notes)

            left.notes.sort((a: TimedNote, b: TimedNote)=>{
                return a.start - b.start
            })
            return left
        }
        throw new Error("Couldn't merge tracks")
    }

    // TODO: get rid of this, it's gross
    // TODO: make sure that we make the left hand coloured red when we're learning the left hand
    function rellietracks():Map<string, TimedNotes> {
        return new Map<string, TimedNotes>(relevantTrack(tracks, currentTask).map((track) => { return [track, tracks.get(track)] as [string, TimedNotes]}))
    }

    function getUsedNotes():Map<string, boolean> {
        let notes = new Map<string, boolean>();
        rellietracks().forEach((tn) => {
            tn.untime().forEach(n => {
                notes.set(n.string(), true)
            });
        });
        return notes
    }

    function getKeys(resizeTrigger):Note[] {
        return range(lowest, highest, highestPianoNote, lowestPianoNote, screenWidth, keyHeight)
    }
</script>

<style lang="scss">
    .centerer {
        height: calc(100% - 50px); // whole page - nav

        .nonpiano {
            height: 67%;
            div {
                height: 100%;
            }
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
            <div>
                <Rules {currentTask} on:next={handleNext} {nextable}></Rules>
            </div>
        {:else}
            <div in:fade>
                <Game keys={ getKeys(resizeTrigger) } tracks={ rellietracks() } {colourer} {duration} {position} {scorer}></Game>
            </div>
        {/if}
    </div>

    <div class="piano">
        {#if tracks.size > 0}
            <div in:fade>
                <Piano keys={ getKeys(resizeTrigger) } {sandbox} instrument={piano} {lessonNotes} {position} scoreKeeper={scorer} on:playingNotes={handlePlayingNotes} usedNotes={getUsedNotes()}></Piano>
            </div>
        {/if}
        {#if loading || !nextable}
            <div class="loading" out:fade>
                <Loader></Loader>
            </div>
        {/if}
    </div>
</div>