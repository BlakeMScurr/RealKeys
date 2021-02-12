<script lang="ts">
    import type { Note } from "../../../lib/music/theory/notes";
    import RollBackground from "./RollBackground.svelte";

    export let keys: Array<Note>;
</script>

<style>
    div {
        width: 100vw;
        height: 100vh;
    }
</style>

<div>
    <RollBackground {keys}></RollBackground>
</div>