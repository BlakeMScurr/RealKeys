<script lang="ts">
    import type { GameMaster } from "../../stores/stores"
    import Dropdown from '../dropdown/Dropdown.svelte';
    import Slider from "../slider/Slider.svelte";

    export let bars;
    export let timesignatures;
    export let gm: GameMaster;

    let speed: number = 1
    $: {
        gm.speedStore.set(speed)
    }

    let playAlongMode = "Play Along Mode"
    // TODO: show descriptions in the dropdown
    let modeList = new Map([
        [playAlongMode, "Play notes as they come"],
        ["Wait Mode", "Playback waits until you play the next note"],
    ])

    function handleModeSelect(e) {
        gm.waitMode.set(e.detail.key !== playAlongMode)
    }
</script>

<style lang="scss">
    .slider {
        max-width: 100px;
        p {
            margin: 0;
        }
    }
</style>

<Dropdown list={modeList} on:select={handleModeSelect}></Dropdown>

<div class="slider">
    <p>Speed {Math.round(speed * 100)}%</p>
    <Slider min={0.1} max={1} step={0.01} bind:value={speed}></Slider>
</div>