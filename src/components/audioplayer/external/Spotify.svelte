<script lang="ts">
    import { getPlayer, play } from "./spotify"

    export let track:string;

    // TODO: put somewhere much safer
    const token = "BQAfV1pxx1yc8vf6k8lv0ESy_goay335FMXevzngOSuHyTPSRuP-Uce31dxOZhPpAOGZfrCSgyiqo7pG1e6p3VsTZQ_DOn_CLr6llhV12oPLtfROVTXhyvBhYVv0LDR9V3piTOEEBFtcyFU98eezg70FAjnHPH9phRw"
    let playing = false;
    let player;

    window.onSpotifyWebPlaybackSDKReady = () => {
        let p = getPlayer(token)
        let played = false;
        p.addListener('ready', ({ device_id }) => {
            if (!played) {
                played = true
                player = p;
                // TODO: disable autoplay
                play(track, player)
                playing = true
            }
        });
    };

    function togglePlay() {
        if (playing) {
            player.pause()
        } else {
            player.resume()
        }
        playing = !playing
    }

    function fastForward() {

    }

    function rewind() {
        player.getCurrentState().then()
    }
</script>

<svelte:head>
    <script src="https://sdk.scdn.co/spotify-player.js"></script>
</svelte:head>

<style>
    /* From https://css-tricks.com/snippets/css/css-triangle/ */
    .arrow-right {
        width: 0; 
        height: 0; 
        border-top: 15px solid transparent;
        border-bottom: 15px solid transparent;
        border-left: calc(1.73205080756 * 15px) solid black; /* top * 1.73205080756, since height of an equilateral triangle is `length * sqrt(3) / 2 ~= length * 0.86602540378` and border top and bottom are `length / 2` */
    }

    .arrow-left {
        width: 0; 
        height: 0; 
        border-top: 15px solid transparent;
        border-bottom: 15px solid transparent; 
        border-right: calc(1.73205080756 * 15px) solid black; 
    }

    .block {
        height: 30px;
        width: 5px;
        background-color: black;
    }

    .playblock {
        height: 30px;
        width: 10px;
        background-color: black;
    }

    .startplay {
        margin-right: 2px;
    }

    .controls>div {
        display: inline-block;
    }

    .controls>div>div {
        display: inline-block;
    }

    .player {
        margin-left: 10px;
        margin-right: 10px;
    }
</style>

<div class="controls" on:click={rewind}>
    <div class="rw">
        <div class="block"></div
        ><div class="arrow-left"></div>
    </div>

    <div class="player" on:click={togglePlay}>
        {#if !playing}
            <div class="arrow-right"></div>
        {:else}
            <div class="playblock startplay"></div>
            <div class="playblock"></div>
        {/if}
    </div>

    <div class="ff" on:click={fastForward}>
        <div class="arrow-right"></div
        ><div class="block"></div>
    </div>
</div>