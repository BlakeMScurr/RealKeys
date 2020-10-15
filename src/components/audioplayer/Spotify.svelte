<!-- TODO: add other kinds of audio players -->

<script lang="ts">
    import { getCookie, removeCookie } from "../../lib/util";
    import { audioReady, tracks } from "../../stores/stores"
    import Login from "../generic/Login.svelte";
    import { getPlayer, play } from "./spotify"
    import UI from "./UI.svelte"

    export let track:string;

    let token = getCookie("token", document.cookie)

    let player;
    const handleAuthenticationError = () => {
        // TODO: actually refresh token here
        token = undefined
        document.cookie = removeCookie("token", document.cookie)
    }

    audioReady.notReady("Loading ")

    // This just waits for our song to play and stops the autoplay
    // TODO: use the web API to cue up the song we want and skip to it so that we don't have to poll to pause the autoplay
    // https://developer.spotify.com/documentation/web-api/reference/player/add-to-queue/
    // https://developer.spotify.com/documentation/web-api/reference/player/skip-users-playback-to-next-track/
    // TODO: make the logical flow more . . . logical
    let stateChanges = 0
    const handleStateChange = (state) => {
        // force a pause
        if (stateChanges == 0) {
            stateChanges++
            runPauserBackoff()
        }
    }

    if (token !== undefined) {
        window.onSpotifyWebPlaybackSDKReady = () => {
            player = getPlayer(token, handleAuthenticationError, handleStateChange)
            player.internal.addListener('ready', ({ device_id }) => {
                player.Volume(0)
                play(track, player.internal)
            });
        };
    }

    function runPauserBackoff() {
        let pauserBackoff;
        pauserBackoff = (i) => {
            if (i >= 0) {
                player.Pause()
                player.Seek(0)
                player.internal.getCurrentState().then((grabbedState)=>{
                    if (grabbedState.paused) {
                        player.Volume(1)
                        tracks.new(player)
                    } else {
                        setTimeout(()=>{pauserBackoff(i-1)}, 20) // TODO: exponential backoff
                    }
                })
            }
        }
        pauserBackoff(50)
    }
</script>

<svelte:head>
    <script src="https://sdk.scdn.co/spotify-player.js"></script>
</svelte:head>

{#if token === undefined}
    <Login></Login>
{:else}
    <UI></UI>
{/if}