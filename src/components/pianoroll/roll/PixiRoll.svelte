<script lang="ts">
    import { onMount } from "svelte";
    import * as PIXI from 'pixi.js';
    
    import type { Note } from "../../../lib/music/theory/notes";
    import type { TimedNotes } from "../../../lib/music/timed/timed";
    import type { Bars } from "../pianoRollHelpers";
    import { drawKeys } from "./Pixi";
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

    onMount(()=>{
        const app = new PIXI.Application();
        mountPoint.appendChild(app.view);

        if (height !== undefined) {
            mountPoint.setAttribute("style","height:" + height + "px");
        }

        app.renderer.view.style.position = "absolute";
        app.renderer.view.style.display = "block";
        // app.renderer.autoResize = true; // TODO: uncomment and fix type warning

        const canvasWidth = mountPoint.clientWidth 
        const canvasHeight = mountPoint.clientHeight 
        app.renderer.resize(canvasWidth, canvasHeight);

        let keyWidth = canvasWidth / keys.length

        drawKeys(keys, app, keyWidth, canvasHeight)
        // drawBarLines(bars, app, canvasHeight)
    })
</script>

<style>
    div {
        width: 100%;
        height: 100%;
        background-color: red;
    }
</style>

<div bind:this={mountPoint}></div>