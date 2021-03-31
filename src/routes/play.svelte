<script lang="ts">
    import Button from "../components/Generic/Buttons/Button.svelte";
    import { stores } from "@sapper/app";
    import { onMount } from "svelte";
    import { fade } from 'svelte/transition';
    import { Colourer } from "../components/colours";
    import Piano from "../components/pianoroll/piano/Piano.svelte";
    import { range } from "../components/pianoroll/pianoRollHelpers";
    import DOMRoll from "../components/pianoroll/roll/DOMRoll.svelte";
    import { levelFromURL } from "../lib/level";
    import { objToURLArgs } from "../lib/util";
    import { getSettings } from "../lib/storage";
    import { TimedNote, TimedNotes } from "../lib/music/timed/timed";
    import { newPiano } from "../lib/track/instrument";
    import ReccomendedButton from "../components/Generic/Buttons/ReccomendedButton.svelte";
    import ScoreBar from "../components/Generic/ScoreBar.svelte";
    import OptionButton from "../components/Generic/Buttons/OptionButton.svelte";
    import { goto } from '@sapper/app'
    import type { VirtualInstrument } from "../lib/track/instrument";

    const { session, page } = stores();

    const query = $page.query;
    let level = levelFromURL(query)
    let notes = level.notes
    let phrase = level.newPhrase()
    let startingScore = level.phraseLength * 2
    let passingScore = level.phraseLength * 5
    let score = startingScore

    
    let usedNotes = new Map<string, boolean>()
    function setUsedNotes(notes) {
        let newsedNotes = new Map<string, boolean>()
        notes.forEach((note) => {
            newsedNotes.set(note.string(), true)
        })
        usedNotes = newsedNotes
    }

    $: {
        setUsedNotes(notes)
    }

    let keys = range(notes[0], notes[notes.length-1])

    let duration = 5000
    let tracks = new Map<string, TimedNotes>([
        ["right", new TimedNotes([])],
        ["wrong", new TimedNotes([])],
    ]);

    let mechanicalPianoPromise = new Promise<VirtualInstrument>((resolve)=>{});
    let userPiano
    onMount(() => {
        if (!getSettings()) {
            session.set({"redirect": $page.path + "?" + objToURLArgs($page.query)})
            goto("/settings")
        }

        userPiano = newPiano("User Piano", ()=>{})

        mechanicalPianoPromise = new Promise((resolve) => {
            let mechanicalPiano: VirtualInstrument;
            mechanicalPiano = newPiano("MechanicalPiano", () => {
                resolve(mechanicalPiano)
            })
        })
    })

    let roll;

    enum gameStates {
        Before = "Before",
        Listening = "Listening",
        Playing = "Playing",
        End = "End",    
    }
    let gameState: gameStates = gameStates.Before

    let handlePlayingNotes = (e) => {}
</script>

<style lang="scss">
    .score {
        position: absolute;
        width: calc(100% - 10px); // lazy man's substitue for padding
        height: 10%;
        display: flex;
        justify-content: flex-end;
        align-items: center;
    }
    .content {
        height: 10%;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        z-index: 2;

        p {
            margin: 0;
            color: grey;
        }

        h3 {
            margin: 0;
        }

        div {
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
        }

        .end {
            position: absolute;
            top: 50px; // ew ew ew horrible hack

            div {
                flex-direction: row;
                z-index: 3;
                margin: 6px;
            }
        }
    }
    .roll {
        height: calc(60% - 50px);
        width: 100%;
    }

    .piano {
        height: 30%;
        position: relative;
    }
</style>

<div class="score">
    <ScoreBar size="medium" value={score} showValue={true} denominator={passingScore}></ScoreBar>
</div>
<div class="content">
    {#await mechanicalPianoPromise}
    {:then mechanicalPiano}
        {#if gameState === gameStates.Before}
            <div transition:fade>
                <ReccomendedButton text="listen" defaultAction={true} on:click={() => {
                    // Clear previous work
                    tracks = new Map([
                        ["right", new TimedNotes([])],
                        ["wrong", new TimedNotes([])],
                    ])
                    phrase = level.newPhrase()
                    notes = level.notes
                    startingScore = level.phraseLength * 2
                    passingScore = level.phraseLength * 5
                    goto(level.playURL())

                    // Listening
                    gameState = gameStates.Listening
                    let noteTime = 1000
                    phrase.forEach((note, i) => {
                        setTimeout(() => {
                            mechanicalPiano.play(note, noteTime, 1)
                            if (i === phrase.length - 1) {
                                setTimeout(() => {

                                    // Playing
                                    gameState = gameStates.Playing

                                    let currentNote = 0
                                    let trackNoteLength = 1 / phrase.length
                                    handlePlayingNotes = (e) => {
                                        let notes = e.detail
                                        if (notes.length === 1) {
                                            tracks.get("right").notes.push(new TimedNote(currentNote * trackNoteLength, (currentNote + 1) * trackNoteLength, phrase[currentNote]))
                                            let newScore = score
                                            newScore++
    
                                            notes.forEach((note) => {
                                                if (phrase[currentNote] !== note) {
                                                    tracks.get("wrong").notes.push(new TimedNote(currentNote * trackNoteLength, (currentNote + 1) * trackNoteLength, note))
                                                    newScore -= level.phraseLength // so that a single error leaves you where you were before
                                                }
                                            })
                                            currentNote++
                                            score = newScore
                                            tracks = tracks

                                            if (currentNote >= phrase.length) {
                                                handlePlayingNotes = ()=>{}
                                                
                                                if (score <= 0) {
                                                    gameState = gameStates.End
                                                }else if(score >= passingScore) {
                                                    level.succeed()
                                                    gameState = gameStates.End
                                                } else {
                                                    gameState = gameStates.Before
                                                }
                                            }
                                        }
                                    }

                                }, noteTime)
                            }
                        }, i * noteTime)
                    })
                }}></ReccomendedButton>
            </div>
        {:else if gameState === gameStates.Listening}
        {:else if gameState === gameStates.Playing}
            <div in:fade>
                <h3>Play back the phrase you just heard</h3>
                <p>(hint: it starts on {phrase[0].enharmonicEquivalent()})</p>
            </div>
        {:else if gameState === gameStates.End}
            {#if score <= 0}
                <div class="end">
                    <div><h3>Bad luck!</h3></div>
                    <div><ReccomendedButton defaultAction={true} text="Retry" on:click={() => {gameState = gameStates.Before; score = startingScore}}></ReccomendedButton></div>
                    <div>
                        {#if level.phraseLength > 2 || level.notePoolSize > 2 || level.maxInterval > 2}
                            <p>or</p>
                        {/if}
                    </div>
                    <div>
                        {#if level.phraseLength > 2}
                            <div><OptionButton text="Shorter Phrases" on:click={() => {level = level.shorterPhrases(); gameState = gameStates.Before; score = startingScore}}></OptionButton></div>
                        {/if}
                        {#if level.notePoolSize > 2 || level.notePoolSize > level.maxInterval}
                            <div><OptionButton text="Fewer Notes" on:click={() => {level = level.fewerNotes(); gameState = gameStates.Before; score = startingScore}}></OptionButton></div>
                        {/if}
                        {#if level.maxInterval > 2}
                            <div><OptionButton text="Shorter Intervals" on:click={() => {level = level.shorterIntervals(); gameState = gameStates.Before; score = startingScore}}></OptionButton></div>
                        {/if}
                    </div>
                </div>
            {:else if score >= passingScore}
            <div class="end">
                <div><h3>Congratulations!</h3></div>
                <div><h4>Increase difficulty by trying</h4></div>
                <div>
                    <div><Button 
                        reccomended={level.phraseLength <= level.maxInterval}
                        text="Longer Phrases"
                        on:click={() => {
                            level = level.longerPhrases();
                            gameState = gameStates.Before;
                            score = startingScore;
                        }}></Button></div>
                    <div><Button 
                        reccomended={level.phraseLength > level.maxInterval && level.notePoolSize <= level.maxInterval}
                        text="More Notes"
                        on:click={() => {level = level.moreNotes(); gameState = gameStates.Before; score = startingScore}}>
                    </Button></div>
                    {#if level.maxInterval < level.notePoolSize}
                        <div><Button 
                            reccomended={level.phraseLength > level.maxInterval && level.notePoolSize > level.maxInterval}
                            text="Longer Intervals"
                            on:click={() => {level = level.longerIntervals(); gameState = gameStates.Before; score = startingScore}}></Button></div>
                    {/if}
                </div>
                <div>
                    <p>or</p>
                </div>
                <div><OptionButton text="Retry"></OptionButton></div>
            </div>
            {/if}
        {/if}
    {/await}
</div>
<div class="roll" bind:this={roll}>
    <DOMRoll {keys} {tracks} colourer={new Colourer(2)} {duration} position={0} heightElement={roll}></DOMRoll>
</div>
<div class="piano">
    <Piano {usedNotes} {keys} instrument={userPiano} on={gameState !== gameStates.Listening} on:playingNotes={handlePlayingNotes}></Piano>
</div>