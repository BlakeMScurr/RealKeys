<script lang="ts">
    import { onMount } from "svelte";
    import OptionButton from "../components/Generic/Buttons/OptionButton.svelte";
    import ReccomendedButton from "../components/Generic/Buttons/ReccomendedButton.svelte";
    import { getSettings, inputType, setSettings } from "../lib/storage";
    import { goto } from "@sapper/app";

    let setInputType = (t: inputType) => { return (e) => {}}
    let currentSetting = null
    onMount(() => {
        currentSetting = getSettings() // TODO: fix content flash while getting settings from local storage 

        console.log("currentSetting",currentSetting)
        setInputType = (t: inputType) => {
            return (e) => {
                switch (t) {
                    case inputType.midi:
                        goto("/settings/setupMIDI")
                        break
                    case inputType.touch:
                        // TODO: warn if one clicks on the touch option, as that may mean they may not have a touch screen (though not necessarily, considera microsoft surcface)
                    case inputType.qwerty:
                        setSettings(t)
                        goto("/") // TODO: go to a redirect
                        break
                }
            }
        }
    })

</script>

<style lang="scss">
    .parentVerticalFlex {
        display: flex;
        flex-direction: column;
        align-items: center;

        div {
            display: flex;
            max-width: 500px;
            width: 80%;
            margin-top: 28px;
            div {
                margin: 0;
                margin-right: 14px;
                display: flex;
                flex-direction: column;
                h4 {
                    margin: 0;
                }
                p {
                    margin: 0;
                }
            }
        }
    }
</style>

<!-- TODO: resolve inconsistency between choose input type and name settings -->
<h2>Settings</h2>

<div class="parentVerticalFlex">
    {#if currentSetting === null}
        <h3>Choose Input Type</h3>
        <div>
            <div>
                <h4>Setup MIDI keyboard</h4>
                <p>Connect your digital piano and play songs of any range.</p>
            </div>
            <ReccomendedButton on:click={setInputType(inputType.midi)} text="Setup"></ReccomendedButton>
        </div>
        <div>
            <div>
                <h4>Use QWERTY keyboard</h4>
                <p>Use your computer’s keyboard to simulate a piano with a range up to one octave and a 5th.</p>
            </div>
            <OptionButton on:click={setInputType(inputType.qwerty)} text="Go"></OptionButton>
        </div>
        <div>
            <div>
                <h4>Use touch screen</h4>
                <p>Use your touch screen to simulate a small piano with an octave of range.</p>
            </div>
            <OptionButton on:click={setInputType(inputType.touch)} text="Go"></OptionButton>
        </div>
    {:else}
        <h3>Input Type: {currentSetting}</h3>
        <ReccomendedButton on:click={()=>{currentSetting = null}} text="Edit"></ReccomendedButton>
    {/if}
</div>