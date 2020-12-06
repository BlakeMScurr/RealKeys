<script lang="ts">
    import { onMount } from "svelte";
    import type { Note } from "../../../lib/music/theory/notes";
    import { initProgram } from "./GL"
    import { TimedNote, TimedNotes } from "../../../lib/music/timed/timed";
    import type { Bars } from "../pianoroll";
    import { zoomWidth } from './roll.ts'

    export let keys:Array<Note>;
    export let height:number;
    export let unit:string;
    export let bars:Bars;
    export let notes:TimedNotes;
    export let position = 0;
    export let zw;
    export let recording = true;
    export let debugSliders = false;

    if (zw === undefined) {
        zw = zoomWidth()
    }

    $: zoomedNotes = notes.notes.map((note) => {
        return new TimedNote(note.start, note.end, note.note)
    })

    $: zoomedBars = bars.bars.map((bar) => {
        return bar
    })

    onMount(()=>{
        main()
    })

    let drawer;
    let draw = ()=>{};
    // Boilerplate taken from https://www.creativebloq.com/javascript/get-started-webgl-draw-square-7112981
    function main() {
        window.onresize = setSize
        const canvas:HTMLCanvasElement = document.querySelector("#glCanvas");

        setSize()
        // Initialize the GL context
        const gl = canvas.getContext("webgl");

        // Only continue if WebGL is available and working
        if (gl === null) {
            alert("Unable to initialize WebGL. Your browser or machine may not support it.");
            return;
        }
        
        drawer = initProgram(gl)
        
        draw = () => {
            gl.clear(gl.COLOR_BUFFER_BIT);
            drawer.setBackground(canvas)
            drawer.drawBlackkeys(keys)
            drawer.drawDividers(keys)
            drawer.drawBars(zoomedBars)
            drawer.drawNotes(keys, zoomedNotes)
        }
        drawer.setTranslate(position/zw)
        drawer.setZoom(zw)
        draw()
    }

    // redraw new notes
    $: {
        if (drawer !== undefined) {
            let _ = zoomedNotes
            let __ = zoomedBars
            draw()
        }
    }

    function setSize() {
        const canvas:HTMLCanvasElement = document.querySelector("#glCanvas");
        if (canvas) {
            // Fix blur
            let dpr = window.devicePixelRatio
            if( dpr !== 1 ){
                canvas.height = canvas.clientHeight
                if (height !== undefined && unit === "px") {
                    canvas.height = height
                }
                canvas.width = canvas.clientWidth * dpr
            }
            draw()
        }
    }

    function setTranslate() {
        if (drawer !== undefined) {
            drawer.setTranslate(position/zw)
            draw()
        }
    }

    function setZoom() {
        if (drawer !== undefined) {
            drawer.setZoom(zw)
            draw()
        }
    }

    $: {
        setTranslate(position)
    }
</script>

<style>
    canvas {
        width: 100%;
        height: 100%;
    }
</style>

<canvas id="glCanvas" width="0px" height="0px"></canvas>

{#if debugSliders}
    <input type="range" on:input={setTranslate} bind:value={position} min="0" max="1" step="0.0001">
    position {position}
    <br>
    <input type="range" on:input={setZoom} bind:value={zw} min="0" max="1" step="0.0001">
    zoom {zw}
{/if}