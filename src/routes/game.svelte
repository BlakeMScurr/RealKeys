<script lang="ts">
    import { stores } from "@sapper/app";
    import { onMount } from "svelte";
    import { fade } from 'svelte/transition';
    import { getLessons, saveLessonProgress } from "../lib/lesson/data";
    import type { LessonSet } from "../lib/lesson/data";
    import { hand, speed, taskSpec, urlToTask } from "../lib/lesson/lesson";
    import { highestPianoNote, lowestPianoNote, NewNote, noteRange, notesBetween } from "../lib/music/theory/notes";
    import { newPiano } from "../lib/track/instrument";
    import { Colourer } from "../components/colours";
    import { getMIDI } from "../lib/midi";
    import type { TimedNotes, TimedNote } from "../lib/music/timed/timed";
    import type { Note } from "../lib/music/theory/notes";
    import Piano from "../components/pianoroll/piano/Piano.svelte";
    import Loader from "../components/loader/Loader.svelte";
    import Rules from "../components/Rules.svelte";
    import Game from "../components/Game.svelte";
    import { GameMaster } from "../stores/stores";
    import { timedScoreKeeper, untimedScoreKeeper } from "../lib/lesson/score";
    import { handleNotes, nextWaitModeNote } from "../stores/waitMode";
    import { writable } from "svelte/store";
    import type { Readable } from "svelte/types/runtime/store"; // TODO: import this from "svelte/store", which works in .ts files not .svelte files
    import { get, getUserID, OneTo100 } from "../lib/util";
    import { goto } from '@sapper/app'
    import { range } from "../components/pianoroll/pianoRollHelpers";

    const { page, session } = stores();
    const query = $page.query;
    let task: taskSpec = urlToTask(query)

    if (!get(getLessons()).has(task.lesson)) {
        throw new Error(`No lesson called ${task.lesson}`)
    }

    // TODO: there's so much state here it's disgusting, we neeeeed to tidy this up!!!
    // required as trying to creating instruments requires window.AudioContext, and errors in preprocessing on the server
    let piano
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

    let onNext = () => {}
    let started = false
    function handleNext() {
        started = true
        onNext()
        sandbox = false
    }
    let handlePlayingNotes = (e: Event) => {}

    let progress: LessonSet;
    getLessons().subscribe((p) => {
        progress = p
    })

    let userID
    getUserID((id) => {
        userID = id
    })

    let lessonNotes: Map<Note, string>;

    onMount(() => {
        piano = newPiano("User Piano", ()=>{loading = false})
        window.onresize = () => {
            resizeTrigger++
        }
        screenWidth = window.innerWidth
        keyHeight = (window.innerHeight - 50) / 3

        getMIDI("api/midi?path=%2FTutorials/" + task.lesson + ".mid", task.startBar, task.endBar).then((midi)=>{
            tracks = midi.tracks
            duration = midi.duration
            colourer = new Colourer(tracks.size)
            let gm = new GameMaster()
            gm.duration.set(duration)
            gm.position.subscribe((pos)=>{
                position = pos
                if (pos >= 1) { // TODO: wait until the last note of the track is done instead
                    task.score = OneTo100(scorer.validRatio() * 100)
                    progress.recordScore(task)
                    saveLessonProgress(userID, progress)
                    // TODO: have session be more consistent, such that it always has the right lessons etc
                    session.set(progress) // lessons is set here so that we have the right value of lessons immediately in score, so that we can calculate the correct next lesson etc
                    goto("score?" + task.queryString())
                }
            })
            let rt = relevantTrack(tracks, task)
    
            tracks.forEach((notes, name) => {
                let trackPiano = newPiano(name, ()=>{console.log(`piano ${name} loaded`)})
                if (rt.includes(name)) {
                    trackPiano.setVolume(0)
                }
                gm.tracks.newPlaybackTrack(name, notes, trackPiano, gm)
            })
            onNext = () => { gm.play.play() }
            nextable = true
            scorer = new timedScoreKeeper(gm.position)
            gm.seek.set(-2000/get(<Readable<number>>gm.duration)) // give space before the first note
    
            switch (task.speed) {
                case speed.OwnPace:
                    gm.seek.set(0) // TODO: go to the first note
                    gm.waitMode.set(true)
                    onNext = () => {
                        //subscribe to the notes needed to progress
                        let stateSetter = writable(new Map<Note, string>());
                        function onNoteStateChange(notes: Map<Note, string>) {
                            let state = get(stateSetter)
                            notes.forEach((noteState: string, note: Note)=>{
                                state.set(note, noteState)
                            })
                            stateSetter.set(state)
                        }
    
                        let activeTrack = mergeTracks(relevantTrack(tracks, task), tracks)
                        gm.seek.subscribe(() => {
                            let state = get(stateSetter)
                            nextWaitModeNote(gm, activeTrack).sameStart.forEach(note => {
                                state.set(note.note, "expecting")
                            })
                            stateSetter.set(state)
                        })
    
                        gm.tracks.subscribeToNotesOfTracks(rt, onNoteStateChange)
    
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
                case speed.Fifty:
                    gm.speed.set(0.5)
                    gm.tracks.subscribeToNotesOfTracks(rt, (notes) => {
                        lessonNotes = notes
                    })
                    break;
                case speed.SeventyFive:
                    gm.speed.set(0.75)
                    gm.tracks.subscribeToNotesOfTracks(rt, (notes) => {
                        lessonNotes = notes
                    })
                    break;
                case speed.OneHundred:
                    gm.speed.set(1)
                    gm.tracks.subscribeToNotesOfTracks(rt, (notes) => {
                        lessonNotes = notes
                    })
                    break;
            }
        }).catch((e)=>{
            throw new Error(e)
        })
    })

    function relevantTrack(tracks: Map<string, TimedNotes>, task: taskSpec):string[] {
        // assumes we have exactly 2 tracks, the first being the left hand, and the second being the right
        let arr = Array.from(tracks.keys())
        switch (task.hand) {
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
        return new Map<string, TimedNotes>(relevantTrack(tracks, task).map((track) => { return [track, tracks.get(track)] as [string, TimedNotes]}))
    }

    function getUsedNotes():Map<string, boolean> {
        let notes = new Map<string, boolean>();
        rellietracks().forEach((tn) => {
            tn.untime().forEach(n => {
                notes.set(n.string(), true)
            });
        });
        console.log("used notes", notes)
        return notes
    }

    function getKeys(tracks: Map<string, TimedNotes>, resizeTrigger):Note[] {
        let untimed = new Array<Note>();
        tracks.forEach((track) => {
            untimed.push(...track.untime())
        })
        return range(untimed, highestPianoNote, lowestPianoNote, screenWidth, keyHeight)
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
                <Rules {task} on:next={handleNext} {nextable}></Rules>
            </div>
        {:else}
            <div in:fade>
                <Game keys={ getKeys(tracks, resizeTrigger) } {task} tracks={ rellietracks() } {colourer} {duration} {position} {scorer}></Game>
            </div>
        {/if}
    </div>

    <div class="piano">
        {#if tracks.size > 0}
            <div in:fade>
                <Piano keys={ getKeys(tracks, resizeTrigger) } {sandbox} instrument={piano} {lessonNotes} {position} {scorer} on:playingNotes={handlePlayingNotes} usedNotes={getUsedNotes()}></Piano>
            </div>
        {/if}
        {#if loading}
            <div class="loading" out:fade>
                <Loader></Loader>
            </div>
        {/if}
    </div>
</div>