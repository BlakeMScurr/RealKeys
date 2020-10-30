<script lang="ts">
    // this wrapper exists to give key stories a concrete width to expand into
    import Key from "./Key.svelte";
    import type { Note } from "../../../../lib/music/theory/notes";

    export let width:number;
    export let note:Note;
    export let active:Boolean;
    export let ghost:Boolean = false;
    export let label:String = "";
    export let state;
</script>

<style>
    div {
        height: 400px;
        width: 400px;
    }
</style>

<div>
    <Key {width} {note} {active} {ghost} {label} {state}></Key>
</div>