<script lang="ts">
    import { position, songDuration, seek, playingStore, audioReady } from "../../../stores/stores";
    import Slider from "../../generic/Slider.svelte";

    export let _storybook_position: number;
    export let _storybook_duration: number;
    export let _storybook_ready: number;
    
    let duration: number;
    let pos: number;
    let ready: {ready: boolean, reason: string};

    songDuration.subscribe((val)=> {
        duration = val
    })
    position.subscribe((val)=> {
        pos = val
    })
    audioReady.subscribe((val)=> {
        ready = val
    })

    $: {
        if (_storybook_ready !== undefined) {
            if (_storybook_ready) {
                audioReady.ready()
            } else {
                audioReady.notReady("storybook user said so")
            }
        }
        if (_storybook_position !== undefined) {
            seek.set(_storybook_position)
        }
        if (_storybook_duration !== undefined) {
            songDuration.set(_storybook_duration)
        }
    }

    // TODO: get this from store
    let loaded = true
    let playing;
    playingStore.subscribe((val) => {
        playing = val
    })

    function rewind () {
        seek.set(pos - 1/duration)
    }

    function togglePlay () {
        if (playing) {
            playingStore.pause()
        } else {
            playingStore.play()
        }
    }

    function fastForward () {
        seek.set(pos + 1/duration)
    }

    function handleSliderSeek(event) {
        seek.set(event.detail)
    }

    function handleKeyDown (event) {
        switch (event.code) {
            case 'Space':
                togglePlay()
                break;
            case 'ArrowLeft': // left arrow
                rewind()
                break;
            case 'ArrowRight': // right arrow
                fastForward()
                break;
        }
    }
</script>


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

    // TODO: overlay a pretty loading icon instead
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


<div class="controls" on:keydown={handleKeyDown}>
    <div class="{"buttons" + (ready.ready ? "" : " cantPlay")}">
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
    <Slider val={pos} on:input={handleSliderSeek}></Slider>
</div>
