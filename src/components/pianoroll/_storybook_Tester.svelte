<script lang="ts">
    import type { Bars, TimedNotes } from "./pianoroll";
    import { position } from "../stores";
    import PianoRoll from "./PianoRoll.svelte";

    export let notes:TimedNotes;
    export let bars:Bars;
    export let pos:number = 0;

    // This class is purely designed as an alternative to passing an argument into the piano roll story.
    // The problem with a basic argument is that it causes the whole component to remount, which gives a
    // very inaccurate idea of the piano roll's performance
    // TODO: one of two workarounds
    // - Try a multi component story with a special class just there to update the store, this class will
    //   accept a position prop, and allow us to make storybook args. Hopefully only that component will remount.
    //   This is blocked because I couldn't figure out how to write a multi component story with svelte.
    // - Make an upstream issue about remounting asking for a flag that prevents full remounting
    $: {
        position.set(pos)
    }
</script>

<input type="range" min=0 max=1 step=0.01 bind:value={pos}>
<PianoRoll {notes} {bars}></PianoRoll>