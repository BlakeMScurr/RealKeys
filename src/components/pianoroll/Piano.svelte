<script lang="ts">
    import { createEventDispatcher } from "svelte";
    import { onMount } from "svelte";
    import { Piano, octavesFrom } from "./piano"
    import { Note, NewAbstractNote } from "./music/theory/chords";

    const dispatch = createEventDispatcher();

    export let firstNote;
    export let octaves;

    onMount(()=>{
        const piano = new Piano(<HTMLCanvasElement>document.querySelector("#piano"), octavesFrom(new Note(NewAbstractNote(firstNote), 3), octaves), dispatch);
        piano.setupWebMidi()
        
        // Setup interactions
        document.addEventListener('keydown', (event) => {
            piano.keyDown(event)
        });
        
        document.addEventListener('keyup', (event) => {
            piano.keyUp(event)
        });
        
        // initial rendering
        piano.render();
    })
</script>

<style>
    div {
        background-color: grey;
    }

    canvas {
        margin-top: 1px;
    }
</style>

<div>
    <canvas id="piano"></canvas>
</div>