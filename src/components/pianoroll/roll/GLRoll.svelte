<script lang="ts">
    import { onMount } from "svelte";
    import type { Note } from "../../../lib/music/theory/notes";
    import type { TimedNotes } from "../../../lib/music/timed/timed";
    import type { Bars } from "../pianoroll";

    // export let keys:Array<Note>;
    // export let height:number;
    // export let unit:string;
    // export let bars:Bars;
    // export let notes:TimedNotes;
    // export let overlayNotes:TimedNotes;
    // export let position = 0;
    export let zoomWidth = 0.2;
    export let recording = true;

    onMount(()=>{
        main()
    })

    function main() {
        const canvas:HTMLCanvasElement = document.querySelector("#glCanvas");
        // Initialize the GL context
        const gl = canvas.getContext("webgl");

        // Only continue if WebGL is available and working
        if (gl === null) {
            alert("Unable to initialize WebGL. Your browser or machine may not support it.");
            return;
        }

        // Set clear color to black, fully opaque
        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        // Clear the color buffer with specified clear color
        gl.clear(gl.COLOR_BUFFER_BIT);
        }
</script>

<canvas id="glCanvas" width="640" height="480"></canvas>