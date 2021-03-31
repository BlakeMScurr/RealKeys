<script lang="ts">
    import { stores } from "@sapper/app";
    import { onMount } from "svelte";
    import { fade } from 'svelte/transition';
    import { Colourer } from "../components/colours";
    import Piano from "../components/pianoroll/piano/Piano.svelte";
    import { range } from "../components/pianoroll/pianoRollHelpers";
    import DOMRoll from "../components/pianoroll/roll/DOMRoll.svelte";
    import { levelFromURL } from "../lib/level";
    import { TimedNote, TimedNotes } from "../lib/music/timed/timed";
    import { newPiano } from "../lib/track/instrument";
    import type { VirtualInstrument } from "../lib/track/instrument";
    import ReccomendedButton from "../components/Generic/Buttons/ReccomendedButton.svelte";
    import type { Note } from "../lib/music/theory/notes";

    const { page } = stores();
    const query = $page.query;
    let level = levelFromURL(query)
    let notes = level.notes
    let phrase = level.newPhrase()
    let score = 10

    let usedNotes = new Map<string, boolean>()
    notes.forEach((note) => {
        usedNotes.set(note.string(), true)
    })

    let keys = range(notes[0], notes[notes.length-1])

    let duration = 1000
    let tracks = new Map<string, TimedNotes>([
        ["right", new TimedNotes([])],
        ["wrong", new TimedNotes([])],
    ]);

    let mechanicalPianoPromise = new Promise<VirtualInstrument>((resolve)=>{});
    let userPiano
    onMount(() => {
        userPiano = newPiano("User Piano", ()=>{})

        mechanicalPianoPromise = new Promise((resolve) => {
            let mechanicalPiano: VirtualInstrument;
            mechanicalPiano = newPiano("MechanicalPiano", () => {
                resolve(mechanicalPiano)
            })
        })
    })

    let roll

    enum gameStates {
        Before = "Before",
        Listening = "Listening",
        Playing = "Playing",
    }
    let gameState: gameStates = gameStates.Before

    let handlePlayingNotes = (e) => {}
</script>

<style lang="scss">
    .content {
        height: 10%;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;

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
<div class="content">
    {#await mechanicalPianoPromise}
    {:then mechanicalPiano}
        {#if gameState === gameStates.Before}
            <div transition:fade>
                <ReccomendedButton text="listen" on:click={() => {

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
                                    let trackNoteLength = duration / phrase.length
                                    handlePlayingNotes = (e) => {
                                        notes = e.detail
                                        if (notes.length > 0) {
                                            tracks.get("right").notes.push(new TimedNote(currentNote * trackNoteLength, (currentNote + 1) * trackNoteLength, phrase[currentNote]))
                                            let newScore = score
                                            newScore++
    
                                            notes.forEach((note) => {
                                                if (phrase[currentNote] !== note) {
                                                    tracks.get("right").notes.push(new TimedNote(currentNote * trackNoteLength, (currentNote + 1) * trackNoteLength, note))
                                                    newScore -= level.phraseLength // so that a single error leaves you where you were before
                                                }
                                            })
                                            currentNote++
                                            score = newScore
                                            tracks = tracks
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
            <div>
                <h3>Play back the phrase you just heard</h3>
                <p>(hint: it starts on {phrase[0].string().toLocaleUpperCase()})</p>
                score: {score}
            </div>
        {/if}
    {/await}
</div>
<div class="roll" bind:this={roll}>
    <DOMRoll {keys} {tracks} colourer={new Colourer(2)} {duration} position={0} heightElement={roll}></DOMRoll>
</div>
<div class="piano">
    <Piano {usedNotes} {keys} instrument={userPiano} on={gameState !== gameStates.Listening} on:playingNotes={handlePlayingNotes}></Piano>
</div>