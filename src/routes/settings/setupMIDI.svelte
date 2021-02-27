<script lang="ts">
    import Loader from "../../components/loader/Loader.svelte";
    import { goto } from "@sapper/app"
    import WebMidi from "webmidi";
    import { onMount } from "svelte";

    onMount(() => {
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
                console.log("enabling web midi")
                if (err) {
                    throw new Error("couldn't enable web midi")
                }
                
                checkInput()
            })
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
        <h3>Connect a MIDI keyboard to your device (usually with a usb cable)</h3>
        <Loader text="Listening for connection"></Loader>
    </div>
</div>