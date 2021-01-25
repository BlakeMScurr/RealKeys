<script lang="ts">
    import { createEventDispatcher, onMount } from "svelte";
    import rs from 'css-element-queries/src/ResizeSensor';
    import type { Note } from "../../../lib/music/theory/notes";
    import type { TimedNotes } from "../../../lib/music/timed/timed";
    import type { Bars } from "../pianoRollHelpers";
    import type { Colourer } from "../../colours";
import RollBackground from "./RollBackground.svelte";

    export let keys:Array<Note>;
    export let height:number;
    export let unit:string;
    export let bars:Bars;
    export let tracks:Map<string, TimedNotes>;
    export let position = 0;
    export let recording = true;
    export let debugSliders = false;
    export let songDuration;
    export let colourer: Colourer;

    let mountPoint;
    let zw = zoomWidth()

    function zoomWidth() {
        // TODO: remove hack
        if (!songDuration) {
            return 1
        }
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
    let ticker

    const dispatch = createEventDispatcher()

    function selectTrack(i: number) {
        dispatch("selectTrack", i)
    }

    onMount(async ()=>{
        PIXI = await import('pixi.js') 		 
        let helpers = await import('./Pixi')
        drawKeys = helpers.drawKeys
        drawBarLines = helpers.drawBarLines
        drawNotes = helpers.drawNotes

        if (height !== undefined) {
            mountPoint.setAttribute("style","height:" + height + "px");
        }

        let initialHeight = mountPoint.clientHeight
        // TODO: why does the mount point resize in the first place? It seems to add an extra 4px to its height when the child canvas mounts, and the child canvas remains at the mount point's original height.
        new rs(mountPoint, ()=> {
            if (mountPoint.clientHeight !== initialHeight) {
                mountPoint.setAttribute("style","height:" + initialHeight + "px");
                app.renderer.resize(mountPoint.clientWidth, mountPoint.clientHeight)
                fullRedraw()
            }
        })

        // TODO: handle dpr so it's crisp on retina displays
        app = new PIXI.Application({width:  mountPoint.clientWidth, height: mountPoint.clientHeight, autoStart: false, transparent: true});
        mountPoint.appendChild(app.view);
        // TODO: why is the canvas 4 pixels smaller than the mount point?

        // prevent internal ticker a la https://github.com/pixijs/pixi.js/issues/1897#issuecomment-112001406 and https://github.com/pixijs/pixi.js/issues/5702
        ticker = app.ticker;

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

    let renderables: {starts: {start: number, pixi: any}[], ends: {end: number, pixi: any}[]};

    // TODO: parameterise
    function fullRedraw() {
        if (app !== undefined) {
            background.removeChildren()
            foreground.removeChildren()
                    
            let keyWidth = mountPoint.clientWidth / keys.length
            // drawKeys(keys, background, keyWidth, mountPoint.clientHeight)
            translate(foreground)
            // drawBarLines(bars, foreground, mountPoint.clientWidth, mountPoint.clientHeight, zw)
            renderables = drawNotes(tracks, foreground, keys, keyWidth, mountPoint.clientHeight, zw, colourer, selectTrack)
            setRenderables();
            ticker.update();
        }
    }

    function translate(foreground: PIXI.Container) {
        if (foreground !== undefined) {
            foreground.setTransform(0, mountPoint.clientHeight * position / zw, 1, 1, 0, 0, 0, 0, 0)
            setRenderables();
            ticker.update();
        }
    }

    // Manually set notes to renderable or otherwise, as pixi doesn't do that itself https://github.com/pixijs/pixi.js/issues/1243
    function setRenderables () {
        if (renderables != undefined) {
            let startWindow = position
            let endWindow = position + zw
            renderables.ends.forEach((e) => {
                e.pixi.renderable = e.end > startWindow
            })
    
            renderables.starts.forEach((s) => {
                s.pixi.renderable = s.start < endWindow && s.pixi.renderable
            })
        }
    }

    $: {
        let _ = position
        translate(foreground)
    }

    $: {
        let __ = tracks
        fullRedraw()
    }

    $: {
        let _ = keys
        fullRedraw()
    }
</script>

<style lang="scss">
    div {
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0);

        .foreground {
            position: absolute;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0);
        }

        .bg {
            position: absolute;
            width: 100%;
            height: 100%;
            z-index: -1;
        }
    }
</style>

<div>
    <div class="foreground" bind:this={mountPoint}></div>
    <div class="bg">
        <RollBackground keys={keys}></RollBackground>
    </div>
</div>

   

{#if debugSliders}
    <input type="range" on:input={()=>{translate(foreground)}} bind:value={position} min="0" max="1" step="0.0001">
    position {position}
    <br>
    <input type="range" on:input={fullRedraw} bind:value={zw} min="0" max="1" step="0.0001">
    zoom {zw}
{/if}