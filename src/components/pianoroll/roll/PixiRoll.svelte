<script lang="ts">
    import { onMount } from "svelte";
    import * as PIXI from 'pixi.js';
    
    import type { Note } from "../../../lib/music/theory/notes";
    import type { TimedNotes } from "../../../lib/music/timed/timed";
    import type { Bars } from "../pianoRollHelpers";
    import { drawKeys, drawBarLines, drawNotes } from "./Pixi";
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
    console.log(zw)

    let app: PIXI.Application;
    let foreground: PIXI.Container;
    onMount(()=>{
        app = new PIXI.Application();
        mountPoint.appendChild(app.view);

        if (height !== undefined) {
            mountPoint.setAttribute("style","height:" + height + "px");
        }

        app.renderer.view.style.position = "absolute";
        app.renderer.view.style.display = "block";
        app.renderer.autoResize = true;

        app.renderer.resize(mountPoint.clientWidth, mountPoint.clientHeight);
        let keyWidth = mountPoint.clientWidth / keys.length
        
        drawKeys(keys, app.stage, keyWidth, mountPoint.clientHeight)
        foreground = new PIXI.Container();
        app.stage.addChild(foreground)
        transformForeground()
        drawBarLines(bars, foreground, mountPoint.clientWidth, mountPoint.clientHeight, zw, position)
        drawNotes(notes, foreground, keys, keyWidth, mountPoint.clientHeight, zw, position)
        window.addEventListener("resize", ()=>{
            app.renderer.resize(mountPoint.clientWidth, mountPoint.clientHeight);
            let keyWidth = mountPoint.clientWidth / keys.length
            drawKeys(keys, app.stage, keyWidth, mountPoint.clientHeight)
            transformForeground()
            drawBarLines(bars, foreground, mountPoint.clientWidth, mountPoint.clientHeight, zw, position)
            drawNotes(notes, foreground, keys, keyWidth, mountPoint.clientHeight, zw, position)
        })
    })

    function transformForeground() {
        if (foreground !== undefined) {
            foreground.setTransform(0, mountPoint.clientHeight * (position/zw -((1/zw) - 1)), 1, 1 / zw, 0, 0, 0, 0, 0)
        }
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
    <input type="range" on:input={transformForeground} bind:value={position} min="0" max="1" step="0.0001">
    position {position}
    <br>
    <input type="range" on:input={transformForeground} bind:value={zw} min="0" max="1" step="0.0001">
    zoom {zw}
{/if}