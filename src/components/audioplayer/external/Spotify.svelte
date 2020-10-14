<script lang="ts">
import { setInterval } from "timers";

    import { getCookie, removeCookie } from "../../../lib/util";
    import Login from "../../generic/Login.svelte";
    import Slider from "../../generic/Slider.svelte";
    import { getPlayer, play } from "./spotify"

    export let track:string;

    let token = getCookie("token", document.cookie)

    // TODO: put somewhere much safer
    let playing = false;
    let player;

    const handleAuthenticationError = () => {
        // TODO: actually refresh token here
        token = undefined
        document.cookie = removeCookie("token", document.cookie)
    }

    // This just waits for our song to play and stops the autoplay
    // TODO: use the web API to cue up the song we want and skip to it so that we don't have to poll to pause the autoplay
    // https://developer.spotify.com/documentation/web-api/reference/player/add-to-queue/
    // https://developer.spotify.com/documentation/web-api/reference/player/skip-users-playback-to-next-track/
    let stateHasChanged = false
    const handleStateChange = (state) => {
        if (!stateHasChanged) {
            // force a pause
            let pauseBackoff;
            pauseBackoff = (i) => {
                if (i >= 0) {
                    player.pause()
                    player.seek(0)
                    player.getCurrentState().then((grabbedState)=>{
                        if (grabbedState.paused) {
                            playing = false
                            stateHasChanged = true
                        } else {
                            // TODO: exponential backoff
                            setTimeout(()=>{pauseBackoff(i-1)}, 20)
                        }

                    })
                }
            }
            pauseBackoff(50)
        }
    }

    if (token !== undefined) {
        window.onSpotifyWebPlaybackSDKReady = () => {
            let p = getPlayer(token, handleAuthenticationError, handleStateChange)
            let played = false;
            p.addListener('ready', ({ device_id }) => {
                if (!played) {
                    played = true
                    player = p;
                    play(track, player)
                    playing = true
                }
            });
        };
    }

    function togglePlay() {
        if (stateHasChanged) {
            if (playing) {
                player.pause()
            } else {
                player.resume()
            }
            playing = !playing
        }
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

<style lang="scss">
    // Traigle formation from https://css-tricks.com/snippets/css/css-triangle/

    $edge_borders: 15px;
    // Gives Equilateral triangle
    // multiplying by 1.73205080757, since height of an equilateral triangle is `length * sqrt(3) / 2 ~= length * 0.86602540378` and border top and bottom are `length / 2`
    $triangle_width: 1.73205080757 * $edge_borders;
    .arrow-right {
        width: 0; 
        height: 0; 
        border-top: $edge_borders solid transparent;
        border-bottom: $edge_borders solid transparent;
        border-left: $triangle_width solid black;
    }

    .arrow-left {
        width: 0; 
        height: 0; 
        border-top: $edge_borders solid transparent;
        border-bottom: $edge_borders solid transparent; 
        border-right: $triangle_width solid black; 
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

    .buttons>div {
        display: inline-block;
    }

    .buttons>div>div {
        display: inline-block;
    }

    $play_button_margin: 10px;
    .buttons {
        width: 88px + 2 * $play_button_margin; // 108 = 31 * 2 + 2 * 10 + 26 = ff + rw + play
        margin: 0 auto;
    }

    .player {
        margin-left: $play_button_margin;
        margin-right: $play_button_margin;
    }

    .controls {
        max-width: 300px;
    }

    .cantPlay {
        div > div.block {
            background-color: grey;
        }

        div > div.playblock {
            background-color: grey;
        }

        div > .arrow-right {
            border-left: $triangle_width solid grey; 
        }

        div > .arrow-left {
            border-right: $triangle_width solid grey; 
        }
    }
</style>

{#if token === undefined}
    <Login></Login>
{:else}
    <div class="controls">
        <div class="{"buttons" + (stateHasChanged ? "" : " cantPlay")}">
            <div class="rw" on:click={rewind}>
                <div class="block"></div
                ><div class="arrow-left"></div>
            </div
            ><div class="player" on:click={togglePlay}>
                {#if !playing}
                    <div class="arrow-right"></div>
                {:else}
                    <div class="playblock startplay"></div>
                    <div class="playblock"></div>
                {/if}
            </div
            ><div class="ff" on:click={fastForward}>
                <div class="arrow-right"></div
                ><div class="block"></div>
            </div>
        </div>
        <Slider></Slider>
    </div>
{/if}