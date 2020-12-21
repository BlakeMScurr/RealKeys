<script lang="ts">
    import { onMount } from "svelte";
    import rs from 'css-element-queries/src/ResizeSensor';
    import type { Note } from "../../../lib/music/theory/notes";
    import type { TimedNotes } from "../../../lib/music/timed/timed";
    import type { Bars } from "../pianoRollHelpers";

    export let keys:Array<Note>;
    export let height:number;
    export let unit:string;
    export let bars:Bars;
    export let notes:TimedNotes;
    export let position = 0;
    export let recording = true;
    export let debugSliders = false;
    export let songDuration;

    let mountPoint;
    let zw = zoomWidth()

    console.log("running the roll rn")
    console.log("songDuration", songDuration)

    function zoomWidth() {
        // TODO: remove hack
        if (!songDuration) {
            return 1
        }
        console.trace()
        console.log("songDuration in zw", songDuration, keys, notes)
        let zoomLength = 4 * 1000 // length of the zoom window in seconds
        let duration;
        songDuration.subscribe((val)=>{
            duration = val
        })
        return zoomLength / duration;
    }

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

        let initialHeight = mountPoint.clientHeight
        // TODO: why does the mount point resize in the first place? It seems to add an extra 4px to its height when the child canvas mounts, and the child canvas remains at the mount point's original height.
        new rs(mountPoint, ()=> {
            if (mountPoint.clientHeight !== initialHeight) {
                mountPoint.setAttribute("style","height:" + initialHeight + "px");
                app.renderer.resize(mountPoint.clientWidth, mountPoint.clientHeight)
                fullRedraw()
            }
        })

        if (height !== undefined) {
            mountPoint.setAttribute("style","height:" + height + "px");
        }

        // TODO: handle dpr so it's crisp on retina displays
        app = new PIXI.Application({width:  mountPoint.clientWidth, height: mountPoint.clientHeight});
        mountPoint.appendChild(app.view);
        // TODO: why is the canvas 4 pixels smaller than the mount point?


        foreground = new PIXI.Container();
        background = new PIXI.Container();
        app.stage.addChild(background)
        app.stage.addChild(foreground)
       
        fullRedraw()

        window.addEventListener("resize", ()=>{
            app.renderer.resize(mountPoint.clientWidth, mountPoint.clientHeight)
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
        background-color: grey;
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