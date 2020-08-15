<script>
    export let audioPlayer;

    let playing = false

    function play() {
        playing = true
        audioPlayer.play()
    }

    function pause () {
        playing = false
        audioPlayer.pause()
    }
</script>

<style>
    button {
        width: 100px;
    }
</style>

{#if playing}
    <button on:click={pause}>Pause</button>
{:else}
    <button on:click={play}>Play</button>
{/if}