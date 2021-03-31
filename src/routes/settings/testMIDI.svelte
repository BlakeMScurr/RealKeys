<script lang="ts">
    import { onDestroy, onMount } from "svelte";
    import Loader from "../../components/loader/Loader.svelte";
    import Piano from "../../components/pianoroll/piano/Piano.svelte";
    import { NewNote, notesBetween } from "../../lib/music/theory/notes";
    import type { Note } from "../../lib/music/theory/notes";
    import { newPiano } from "../../lib/track/instrument";
    import { inputType, setSettings } from "../../lib/storage";
    import { goto, stores } from "@sapper/app";
    import { get } from "../../lib/util";

    const { session } = stores();


    let piano;
    onMount(() => {
        piano = newPiano("tester", ()=>{console.log("piano loaded")})
    })

    let complete = false;
    let handlePlayingNotes = (e) => {
        if (!complete) {
            let notes: Array<Note> = e.detail;
            if (notes.includes(NewNote("C", 4))) {
                complete = true
                setSettings(inputType.midi)
                setTimeout(() => {
                    let s = get(session)
                    if (s && typeof s.redirect !== "undefined") {
                        session.set({})
                        goto(s.redirect)
                    } else {
                        goto("/settings")
                    }
                }, 500);
            }
        }
    }

    onDestroy(()=>{
        // TODO: why do Middle Cs sometimes seem to be triggering us to go back to settings when we're in game?
        handlePlayingNotes = ()=>{}
    })

</script>

<style lang="scss">
    .vert {
        display: flex;
        align-items: center;
        flex-direction: column;
        justify-content: space-between;
        height: calc(100% - 50px);

        .titleHolder {
            display: flex;
            align-items: center;
            flex-direction: column;
        }

        .pianoHolder {
            align-self: flex-start;
            width: 100%;
            height: 40%;
            position: relative;
        }
    }
</style>

<div class="vert">
    <h2>Test Keyboard</h2>
    {#if !complete}
        <div class="titleHolder">
            <h3>Play middle C on your MIDI keyboard to test the connection</h3>
            <Loader text="Waiting for middle C"></Loader>
        </div>
    {:else}
        <div class="titleHolder">
            <h3>Setup complete</h3>
            <img src="/Tick.png" alt="tick">
        </div>
    {/if}
    <div class="pianoHolder">
        <Piano lessonNotes={new Map([[NewNote("C", 4), "expecting"]])} keys={notesBetween(NewNote("G", 3), NewNote("C", 5))} instrument={piano} sandbox={true} midiOnly={true} on:playingNotes={handlePlayingNotes}></Piano>
    </div>
</div>