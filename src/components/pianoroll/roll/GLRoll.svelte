<script lang="ts">
    import { onMount } from "svelte";
    import type { Note } from "../../../lib/music/theory/notes";
    import { setBackground, initProgram, drawBlackkeys, drawDividers, drawBars, drawNotes } from "./GL"
    import { TimedNote, TimedNotes } from "../../../lib/music/timed/timed";
    import type { Bars } from "../pianoroll";

    export let keys:Array<Note>;
    // export let height:number;
    // export let unit:string;
    export let bars:Bars;
    export let notes:TimedNotes;
    // export let position = 0;
    export let zoomWidth = 0.2;
    export let recording = true;

    let zoomedNotes = notes.notes.map((note) => {
        return new TimedNote(note.start / zoomWidth, note.end / zoomWidth, note.note)
    })

    let zoomedBars = bars.bars.map((bar) => {
        return bar / zoomWidth
    })

    onMount(()=>{
        main()
    })

    // Boilerplate taken from https://www.creativebloq.com/javascript/get-started-webgl-draw-square-7112981
    function main() {
        const canvas:HTMLCanvasElement = document.querySelector("#glCanvas");

        // Initialize the GL context
        const gl = canvas.getContext("webgl");

        // Fix blur
        let dpr = window.devicePixelRatio
        if( dpr !== 1 ){
            canvas.height = canvas.clientHeight * dpr
            canvas.width = canvas.clientWidth * dpr
        }

        // Only continue if WebGL is available and working
        if (gl === null) {
            alert("Unable to initialize WebGL. Your browser or machine may not support it.");
            return;
        }

        
        let drawer = initProgram(gl)

        drawer.setBackground(canvas)
        drawer.drawBlackkeys(keys)
        drawer.drawDividers(keys)
        drawer.drawBars(zoomedBars)
        drawer.drawNotes(keys, zoomedNotes)
    }
</script>

<style>
    canvas {
        width: 100%;
        height: 100%;
    }
</style>

<canvas id="glCanvas" width="400px" height="300px"></canvas>