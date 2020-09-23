<script>
    import { createEventDispatcher } from "svelte";

    let dispatch = createEventDispatcher();
    let recording = false

    function start () {
        dispatch("startRecording")
        recording = true
    }

    function stop () {
        dispatch("stopRecording")
        recording = false
    }
</script>

<style>
    .stop {
        background-color: red;
        color:white;
    }
</style>

{#if recording}
    <button class="stop" on:click={stop}>Stop Recording</button>
{:else}
    <button class="start" on:click={start}>Record</button>
{/if}