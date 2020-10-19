<script lang="ts">
    import { createEventDispatcher, onMount } from "svelte";

    export let min: number = 0;
    export let max: number = 1;
    export let step: number = 0.000001; // TODO: is it bad for performance to set such a low step?
    export let value: number = 0;

    let inputElement;

    let dispatch = createEventDispatcher();

    function handleInput() {
        setbackground()
    }

    let grabbed = false;
    function grab() {
        grabbed = true;
    }

    function release() {
        grabbed = false;
        value = val
        dispatch('input', val)
    }

    let val = value
    $: {
        if (!grabbed) {
            val = value
        }
    }
    
    function setbackground(){
        // Handles preplay styling a la https://stackoverflow.com/a/57153340/7371580
        // TODO: fix trailing black space behind thumb when fast forwarding by
        // making sure that this uses the correct value when the props are updated
        // TODO: decrease height so it's not taking the whole track, giving the user more space to click
        let thumbPosition = (val-inputElement.min)/(inputElement.max-inputElement.min)*100
        inputElement.style.background = 'linear-gradient(to right, #667ED4 0%, #667ED4 ' + thumbPosition + '%, #000 ' + thumbPosition + '%, #000 100%)'
    }
    
    let mounted;
    onMount(()=>{
        setbackground()
        mounted = true
    })

    $: { if (val == val && mounted) {setbackground()} }
</script>

<style lang="scss">
    // Base from https://github.com/darlanrod/input-range-scss/blob/master/_inputrange.scss
    // TODO: remove cruft that's now extraneous - and make sure it works on all browsers!
    $track-color: #000000 !default;
    $thumb-color: #667ED4 !default; // TODO: import from module

    $thumb-radius: 7px !default;
    $thumb-height: 14px !default;
    $thumb-width: 14px !default;

    $track-width: 100% !default;
    $track-height: 3px !default;

    $track-radius: 5px !default;
    $contrast: 0% !default;

    $ie-bottom-track-color: darken($track-color, $contrast) !default;

    input {
        background: linear-gradient(to right, $thumb-color 0%,$thumb-color 50%, $track-color 50%, $track-color 100%);
        border-radius: 8px;
        height: $track-height;
        outline: none;
        transition: background 450ms ease-in;
        -webkit-appearance: none;
    }

    @mixin track {
        cursor: default;
        height: $track-height;
        transition: all .2s ease;
        width: $track-width;
    }

    @mixin thumb {
        background: $thumb-color;
        border-radius: $thumb-radius;
        box-sizing: border-box;
        cursor: default;
        height: $thumb-height;
        width: $thumb-width;
    }

    [type='range'] {
        -webkit-appearance: none;
        background: transparent;
        margin: $thumb-height / 2 0;
        width: $track-width;

        &::-moz-focus-outer {
            border: 0;
        }

        &:focus {
            outline: 0;
        }

        &::-webkit-slider-runnable-track {
            @include track;
            border-radius: $track-radius;
        }

        &::-webkit-slider-thumb {
            @include thumb;
            -webkit-appearance: none;
            margin-top: (($track-height) / 2 - $thumb-height / 2);
        }

        &::-moz-range-track {
            @include track;
            border-radius: $track-radius;
            height: $track-height / 2;
        }

        &::-moz-range-thumb {
            @include thumb;
        }

        &::-ms-track {
            @include track;
            border-color: transparent;
            border-width: ($thumb-height / 2) 0;
            color: transparent;
        }

        &::-ms-fill-lower {
            border-radius: ($track-radius * 2);
        }

        &::-ms-fill-upper {
            border-radius: ($track-radius * 2);
        }

        &::-ms-thumb {
            @include thumb;
            margin-top: $track-height / 4;
        }

        &:disabled {
            &::-webkit-slider-thumb,
            &::-moz-range-thumb,
            &::-ms-thumb,
            &::-webkit-slider-runnable-track,
            &::-ms-fill-lower,
            &::-ms-fill-upper {
            cursor: not-allowed;
            }
        }
    }
</style>

<input type="range" bind:value={val} {min} {max} {step} on:input={handleInput} bind:this={inputElement} on:mousedown={grab} on:touchstart={grab} on:mouseup={release} on:touchend={release}>
