<script lang="ts">
    import { goto, stores } from '@sapper/app';
    import { onDestroy, onMount } from "svelte";
    import { writable } from "svelte/store";
    import type { Readable } from "svelte/store";
    import { fade } from 'svelte/transition';
    import GameLayout from "../components/GameLayout.svelte";
    import Loader from "../components/loader/Loader.svelte";
    import Piano from "../components/pianoroll/piano/Piano.svelte";
    import { range } from "../components/pianoroll/pianoRollHelpers";
    import Rules from "../components/Rules.svelte";
    import type { Curriculum } from '../lib/gameplay/curriculum/curriculum';
    import { defaultLessons } from '../lib/gameplay/curriculum/data';
    import { methodologyName } from '../lib/gameplay/curriculum/methodology/methodology';
    import type { task } from "../lib/gameplay/curriculum/task";
    import { modeName } from '../lib/gameplay/mode/mode';
    import type { scorer } from '../lib/gameplay/score/score';
    import { notesBetween } from "../lib/music/theory/notes";
    import type { Note } from "../lib/music/theory/notes";
    import { highestPianoNote,lowestPianoNote } from "../lib/music/theory/notes";
    import { getProgress, getSettings } from "../lib/storage";
    import { newPiano } from "../lib/track/instrument";
    import { handleErrors,objToURLArgs, OneTo100 } from "../lib/util";
    import type { noteState } from '../stores/track';
    import { defaultGame,getGameDef,getUsedNotes,rellietracks } from "./gameHelpers";
    import OptionButton from './Generic/Buttons/OptionButton.svelte';
    import ReccomendedButton from './Generic/Buttons/ReccomendedButton.svelte';
    import ScoreBar from './Generic/ScoreBar.svelte';

    export let text: string = "";
    export let currentTask: task;
    export let courseName: string = "Tutorials";
    export let curriculum: Curriculum;
    export let next = ()=>{}
    export let forward: Readable<[task, string, Curriculum]>
    export let highest: Note;
    export let lowest: Note;

    const { session, page } = stores();

    // required as trying to creating instruments requires window.AudioContext, and errors in preprocessing on the server
    let piano;
    let resizeTrigger = 0
    let screenWidth = 500
    let keyHeight = 120
    
    let gd = defaultGame()
    
    let sandbox = true
    
    let position
    let started = false
    function handleNext() {
        started = true
        gd.onNext()
        sandbox = false
    }
    let finalScore = -1
    let score = 0;
    let noteCleanUp = () => {}

    let lessonNotes: Map<Note, noteState>;

    onDestroy(()=>{
        gd.cleanup()
    })

    onMount(() => {
        if (!getSettings()) {
            session.set({"redirect": $page.path + "?" + objToURLArgs($page.query)})
            goto("/settings")
        }

        handleErrors(window)
        // TODO: unlock iOS audio as per https://gist.github.com/laziel/7aefabe99ee57b16081c
        window.AudioContext = window.AudioContext || window["webkitAudioContext"] // TODO: move to some polyfill location which is guaranteed to be called before application code.


        // TODO: make a promise to combine with the game definition's instruments loaded promise
        piano = newPiano("User Piano", ()=>{})
        window.onresize = () => {
            resizeTrigger++
        }
        screenWidth = window.innerWidth
        keyHeight = (window.innerHeight - 50) / 3

        let buildGame = () => {
            let positionStore = writable(0)
            positionStore.subscribe((pos: number) => {
                position = pos
            })
    
            let notesStore = writable(new Map<Note, noteState>())
            noteCleanUp = notesStore.subscribe((notes: Map<Note, noteState>) => {
                lessonNotes = notes
            })
    
            if (!curriculum) curriculum = defaultLessons()
    
            let onComplete
            switch(currentTask.getMethodology()) {
                case methodologyName.sequential: // TODO: use the enums
                    onComplete = (s: scorer) => {
                        let score = OneTo100(s.validRatio() * 100)
                        getProgress(curriculum).recordScore(currentTask, score)
                        goto("score?" + currentTask.queryString() + "&score=" + score)
                    }
                    break
                case methodologyName.tutorial:
                    onComplete = (s: scorer) => {
                        let score = OneTo100(s.validRatio() * 100)
                        getProgress(curriculum).recordScore(currentTask, score)
                        finalScore = score
                        sandbox = true // Let you play around after finishing
                        if (currentTask.getMode().modeName() === modeName.wait) {
                            next()
                        }
                    }
                    break
                default:
                    throw new Error(`invalid methodology "${currentTask.getMethodology()}"`)
            }
    
            getGameDef(courseName, currentTask, positionStore.set, notesStore.set, onComplete).then((newgd) => {
                gd = newgd
                if (currentTask.getMethodology() === methodologyName.tutorial && currentTask.getMode().modeName() === modeName.wait) {
                    handleNext()
                }
                gd.scorer.subscribe((s: number) => {
                    score = s
                })
            })
        }

        buildGame()

        if (forward) {
            forward.subscribe((v) => {
                if (v !== null) {
                    currentTask = v[0]
                    text = v[1]
                    curriculum = v[2]

                    gd.gm.play.pause()
                    // TODO: reduce code repetition here
                    sandbox = true
                    position
                    started = false
                    finalScore = -1
                    score = 0;
                    // resize refering here also to the size of the keyboard
                    // TODO: fix misnomer
                    resizeTrigger++
                    buildGame()
                }
            })
        }
    })

    function getKeys(resizeTrigger):Note[] {
        if (highest && lowest) {
            return notesBetween(lowest, highest)
        }
        return range(gd.lowest, gd.highest, highestPianoNote, lowestPianoNote, screenWidth, keyHeight)
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

            .overlayHolder {
                position: absolute;
                z-index: 2;
                height: 67%;
                display: flex;
                justify-content: center;
                width: 100%;
                .textOverlay {
                    margin: 20px;
                    padding: 20px;
                    background-color: #ffffff;
                    height: fit-content;
                    height: fit-content;
                    border-radius: 10px;
                    box-shadow: 5px 5px #ddd, -5px 5px #ddd, 5px -5px #ddd, -5px -5px #ddd;
                    max-height: 50%;
                    overflow: scroll;

                    h5 {
                        text-align: center;
                    }

                    .buttons {
                        display: flex;
                        justify-content: center;

                        div {
                            padding: 10px;
                        }
                    }
                }

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
        {#if text === ""}
            {#if !started}
                <div>
                    <Rules {currentTask} on:next={handleNext} nextable={gd.instrumentsLoaded}></Rules>
                </div>
            {:else}
                <div in:fade>
                    <GameLayout keys={ getKeys(resizeTrigger) } tracks={ rellietracks(currentTask, gd.tracks) } colourer={gd.colourer} duration={gd.duration} {position} scorer={gd.scorer}></GameLayout>
                </div>
            {/if}
        {:else}
            <div class="overlayHolder">
                <div class="textOverlay">
                    <h3>{text.split("(tip:")[0]}</h3>
                    <h5>{text.split("(tip:")[1]? "(tip:" + text.split("(tip:")[1]: ""}</h5>
                    <div class="buttons">
                        {#if currentTask.getMode().modeName() === modeName.play}
                            {#if finalScore !== -1}
                                <div><OptionButton text="listen again" on:click={()=>{gd.gm.seek.set(0); gd.gm.play.play()}}></OptionButton></div>
                                <div><ReccomendedButton text="next" on:click={next} defaultAction={true}></ReccomendedButton></div>
                            {:else}
                                <div><ReccomendedButton text="listen" on:click={handleNext} defaultAction={true}></ReccomendedButton></div>
                            {/if}
                        {:else if currentTask.getMode().modeName() === modeName.wait}
                            {#if finalScore === 100}
                                <div><ReccomendedButton text="next" on:click={next} defaultAction={true}></ReccomendedButton></div>
                            {:else if finalScore === -1}
                                <div><ScoreBar size={"medium"} showValue={false} value={ score*100 }></ScoreBar></div>
                            {:else}
                                <div><ReccomendedButton text="retry" on:click={()=>{gd.gm.seek.set(0); gd.scorer.reset(); gd.scorer.subscribe((s)=>{score=s}); gd = gd; finalScore = -1; sandbox = false}} defaultAction={true}></ReccomendedButton></div>
                            {/if}
                        {/if}
                    </div>
                </div>
            </div>
            {#if gd.tracks.size > 0}
                <GameLayout keys={ getKeys(resizeTrigger) } tracks={ rellietracks(currentTask, gd.tracks) } colourer={gd.colourer} duration={gd.duration} {position} scorer={gd.scorer} showScore={text === ""}></GameLayout>
            {/if}
        {/if}
    </div>

    <div class="piano">
        {#if gd.tracks.size > 0}
            <div in:fade>
                <Piano keys={ getKeys(resizeTrigger) } sandbox={sandbox || currentTask.getMode().modeName() === modeName.play} instrument={piano} {lessonNotes} {position} scoreKeeper={gd.scorer} on:playingNotes={gd.handlePlayingNotes} usedNotes={getUsedNotes(currentTask, gd.tracks)} mode={currentTask.getMode().modeName()}></Piano>
            </div>
        {/if}
        
        {#await new Promise(r => setTimeout(r, 200))}
            {#await gd.instrumentsLoaded}
                <div class="loading" out:fade in:fade>
                    <Loader></Loader>
                </div>
            {/await}
        {/await}
    </div>
</div>