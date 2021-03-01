<script lang="ts">
    import Loader from "../../components/loader/Loader.svelte";
    import { goto } from "@sapper/app"
    import WebMidi from "webmidi";
    import { onMount } from "svelte";
import ReccomendedButton from "../../components/Generic/Buttons/ReccomendedButton.svelte";

    let error = ""
    onMount(() => {
        try {
            let checkInput = () => {
                let inputCheckerInterval = setInterval(() => {
                    if (WebMidi.inputs[0]) {
                        clearInterval(inputCheckerInterval)
                        goto("settings/testMIDI")
                    }
                }, 100)
            }

            if (WebMidi.enabled) {
                checkInput()
            } else {
                WebMidi.enable(function (err) {
                    if (err) {
                        throw new Error("couldn't enable web midi" + err)
                    }
                    
                    checkInput()
                })
            }
        } catch (e) {
            error = e
        }
    })
</script>

<style lang="scss">
    .vert {
        display: flex;
        align-items: center;
        margin: 0 14px 0 14px;
        flex-direction: column;
        justify-content: space-around;
        height: calc(100% - 50px);

        div {
            display: flex;
            align-items: center;
            flex-direction: column;
        }  
    }
</style>

<h2>Connect Keyboard</h2>
<div class="vert">
    <div>
    {#if error === ""}
        <h3>Connect a MIDI keyboard to your device (usually with a usb cable)</h3>
        <Loader text="Listening for connection"></Loader>
    {:else}
        <h3>Failed to setup MIDI</h3>
        <!-- TODO: actually check the browser is relevant -->
        <!-- TODO: specifically tell them what the issue with their browser is, i.e., you just can't do it on iOS -->
        <!-- TODO: don't even let people with incompatible browsers see the option (maybe it should be locked) -->
        <p>See list of compatible browsers <a href="https://caniuse.com/midi">here</a></p>
        <ReccomendedButton on:click={()=>{goto("/settings")}} text="Back to settings"></ReccomendedButton>
    {/if}
    </div>
</div>