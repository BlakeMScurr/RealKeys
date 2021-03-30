<script lang="ts">
    import { stores } from "@sapper/app";
    import { onMount } from "svelte";
    import Piano from "../components/pianoroll/piano/Piano.svelte";
    import { range } from "../components/pianoroll/pianoRollHelpers";
    import { levelFromURL } from "../lib/level";
    import { newPiano } from "../lib/track/instrument";
    
    const { page } = stores();
    const query = $page.query;
    let level = levelFromURL(query)
    let notes = level.notes

    let usedNotes = new Map<string, boolean>()
    notes.forEach((note) => {
        usedNotes.set(note.string(), true)
    })

    let piano
    let x
    onMount(() => {
        piano = newPiano("User Piano", ()=>{})
        
        x = level.newPhrase().map((n)=>{return n.string()})
    })
</script>

{x}

<Piano {usedNotes} keys={range(notes[0], notes[notes.length-1])} instrument={piano}></Piano>