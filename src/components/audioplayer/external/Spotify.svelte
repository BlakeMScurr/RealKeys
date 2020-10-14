<script lang="ts">
    import { getCookie, removeCookie } from "../../../lib/util";
    import Login from "../../generic/Login.svelte";
    import { getPlayer, play } from "./spotify"

    export let track:string;

    let token = getCookie("token", document.cookie)

    // TODO: put somewhere much safer
    let playing = false;
    let player;

    if (token !== undefined) {
        window.onSpotifyWebPlaybackSDKReady = () => {
            const handleAuthenticationError = () => {
                // TODO: actually refresh token here
                token = undefined
                document.cookie = removeCookie("token", document.cookie)
            }

            let p = getPlayer(token, handleAuthenticationError)
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
    }

    function togglePlay() {
        if (playing) {
            player.pause()
        } else {
            player.resume()
        }
        playing = !playing
    }

    function dSeek(delta: number) {
        player.getCurrentState().then((state)=>{
            player.seek(state.position + delta)
        })
    }

    function fastForward() {
        dSeek(1000)
    }

    function rewind() {
        dSeek(-1000)
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

{#if token === undefined}
    <Login></Login>
{:else}
    <div class="controls">
        <div class="rw" on:click={rewind}>
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
{/if}