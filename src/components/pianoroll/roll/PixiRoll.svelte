<script lang="ts">
    import { onMount } from "svelte";
    
    import type { Note } from "../../../lib/music/theory/notes";
    import type { TimedNotes } from "../../../lib/music/timed/timed";
    import type { Bars } from "../pianoRollHelpers";
    import { zoomWidth } from './roll.ts'

    export let keys:Array<Note>;
    export let height:number;
    export let unit:string;
    export let bars:Bars;
    export let notes:TimedNotes;
    export let position = 0;
    export let recording = true;
    export let debugSliders = false;

    let mountPoint;
    let zw = zoomWidth()

    let app;
    let foreground;
    let background;
    let PIXI	
    let drawKeys
    let drawBarLines
    let drawNotes
    onMount(async ()=>{
        PIXI = await import('pixi.js') 		 
        let helpers = await import('./Pixi')
        drawKeys = helpers.drawKeys
        drawBarLines = helpers.drawBarLines
        drawNotes = helpers.drawNotes

        // TODO: handle dpr so it's crisp on retina displays
        app = new PIXI.Application({width:  mountPoint.clientWidth, height:  mountPoint.clientHeight});
        mountPoint.appendChild(app.view);
        console.log(mountPoint.clientHeight, mountPoint.clientWidth)

        if (height !== undefined) {
            mountPoint.setAttribute("style","height:" + height + "px");
        }

        foreground = new PIXI.Container();
        background = new PIXI.Container();
        app.stage.addChild(background)
        app.stage.addChild(foreground)
       
        fullRedraw()

        window.addEventListener("resize", ()=>{
            fullRedraw()
        })
    })

    // TODO: parameterise
    function fullRedraw() {
        if (app !== undefined) {
            background.removeChildren()
            foreground.removeChildren()
                    
            let keyWidth = mountPoint.clientWidth / keys.length
            drawKeys(keys, background, keyWidth, mountPoint.clientHeight)
            translate(foreground)
            drawBarLines(bars, foreground, mountPoint.clientWidth, mountPoint.clientHeight, zw)
            drawNotes(notes, foreground, keys, keyWidth, mountPoint.clientHeight, zw)
        }
    }

    function translate(foreground: PIXI.Container) {
        if (foreground !== undefined) {
            foreground.setTransform(0, mountPoint.clientHeight * position / zw, 1, 1, 0, 0, 0, 0, 0)
        }
    }

    $: {
        let _ = position
        translate(foreground)
    }

    $: {
        let _ = keys
        let __ = notes
        fullRedraw()
    }
</script>

<style>
    div {
        width: 100%;
        height: 100%;
        background-color: black;
    }
</style>

<div bind:this={mountPoint}></div>

{#if debugSliders}
    <input type="range" on:input={()=>{translate(foreground)}} bind:value={position} min="0" max="1" step="0.0001">
    position {position}
    <br>
    <input type="range" on:input={fullRedraw} bind:value={zw} min="0" max="1" step="0.0001">
    zoom {zw}
{/if}