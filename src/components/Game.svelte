<script lang="ts">
    import { onDestroy, onMount } from "svelte";
    import { fade } from 'svelte/transition';
    import { getSettings } from "../lib/storage";
    import { highestPianoNote, lowestPianoNote, NewNote} from "../lib/music/theory/notes";
    import { newPiano } from "../lib/track/instrument";
    import { Colourer } from "../components/colours";
    import type { TimedNotes } from "../lib/music/timed/timed";
    import type { Note } from "../lib/music/theory/notes";
    import Piano from "../components/pianoroll/piano/Piano.svelte";
    import Loader from "../components/loader/Loader.svelte";
    import Rules from "../components/Rules.svelte";
    import GameLayout from "../components/GameLayout.svelte";
    import { GameMaster } from "../stores/stores";
    import { timedScoreKeeper } from "../lib/gameplay/score/score";
    import { handleErrors, objToURLArgs } from "../lib/util";
    import { goto, stores } from '@sapper/app'
    import { range } from "../components/pianoroll/pianoRollHelpers";
    import type { task } from "../lib/gameplay/curriculum/task";
    import { defaultGame, gameDefinition, getGameDef, getUsedNotes, rellietracks } from "./gameHelpers";
    import { writable } from "svelte/store";

    export let text: string = "";
    export let currentTask: task;
    export let courseName: string = "Tutorials";
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

    let lessonNotes: Map<Note, string>;

    let cleanup = ()=>{}
    onDestroy(()=>{
        cleanup()
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

        let positionStore = writable(0)
        positionStore.subscribe((pos: number) => {
            position = pos
        })

        let notesStore = writable(new Map<Note, string>())
        notesStore.subscribe((notes: Map<Note, string>) => {
            lessonNotes = notes
        })

        getGameDef(courseName, currentTask, positionStore.set, notesStore.set).then((newgd) => {
            gd = newgd
        })

    })

    function getKeys(resizeTrigger):Note[] {
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
            <GameLayout keys={ getKeys(resizeTrigger) } tracks={ rellietracks(currentTask, gd.tracks) } colourer={gd.colourer} duration={gd.duration} {position} scorer={gd.scorer}></GameLayout>
        {/if}
    </div>

    <div class="piano">
        {#if gd.tracks.size > 0}
            <div in:fade>
                <Piano keys={ getKeys(resizeTrigger) } {sandbox} instrument={piano} {lessonNotes} {position} scoreKeeper={gd.scorer} on:playingNotes={gd.handlePlayingNotes} usedNotes={getUsedNotes(currentTask, gd.tracks)}></Piano>
            </div>
        {/if}
        
        {#await gd.instrumentsLoaded}
            <div class="loading" out:fade>
                <Loader></Loader>
            </div>
        {/await}
    </div>
</div>