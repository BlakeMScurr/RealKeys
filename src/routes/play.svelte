<script lang="ts">
    import { stores } from "@sapper/app";
    import { onMount } from "svelte";
    import Piano from "../components/pianoroll/piano/Piano.svelte";
    import { range } from "../components/pianoroll/pianoRollHelpers";
    import { levelFromURL } from "../lib/level";
    import { NewNote } from "../lib/music/theory/notes";
    import { scale } from "../lib/music/theory/scales";
    import { newPiano } from "../lib/track/instrument";
    
    const { page } = stores();
    const query = $page.query;
    let level = levelFromURL(query)
    let notes = level.scale.notes

    let usedNotes = new Map<string, boolean>()
    notes.forEach((note) => {
        usedNotes.set(note.string(), true)
    })

    let piano
    onMount(() => {
        piano = newPiano("User Piano", ()=>{})
    })

</script>

<Piano {usedNotes} keys={range(notes[0], notes[notes.length-1])} instrument={piano}></Piano>