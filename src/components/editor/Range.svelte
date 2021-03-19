<script lang="ts">
    import { createEventDispatcher } from "svelte";
    import { rangeDefintion } from "../../lib/gameplay/curriculum/methodology/builder";
    import { NewNote } from "../../lib/music/theory/notes";
    import type { Note } from "../../lib/music/theory/notes";

    export let defaultRange: boolean = true;
    export let lowest: Note; 
    export let highest: Note; 

    $: lowestStr = lowest.string()
    $: highestStr = highest.string()

    function handleLowestChange() {
        try {
            let s = split(lowestStr)
            let newlowest = NewNote(s[0], s[1])
            if (highest.lowerThan(newlowest)) {
                throw new Error(`${newlowest.string()} is higher than ${highest.string()}`)
            }
            lowest = newlowest
            lowestStr = lowest.string()
            edited()
        } catch(e) {
            lowestStr = lowest.string()
            alert(e)
        }
    }

    function handleHighestChange() {
        try {
            let s = split(highestStr)
            let newhighest = NewNote(s[0], s[1])
            if (newhighest.lowerThan(lowest)) {
                throw new Error(`${lowest.string()} is higher than ${newhighest.string()}`)
            }
            highest = newhighest
            highestStr = highest.string()
            edited()
        } catch(e) {
            highestStr = highest.string()
            alert(e)
        }
    }

    function split(str: string):[string, number] {
        let pitchStr = str.split(/[0-9]/)[0]
        let num = parseInt(str.split(pitchStr)[1])
        return [pitchStr, num]
    }


    let dispatch = createEventDispatcher()
    function edited() {
        let l = split(lowest.string())
        let h = split(highest.string())
        let def = new rangeDefintion(defaultRange, l[0], l[1], h[0], h[1])
        dispatch("edit", def)
    }
</script>

<h1>Range</h1>

<input type="checkbox" bind:checked={defaultRange} on:change={edited}>

{#if !defaultRange}
    <label for="lowest">Lowest</label>
    <input id="lowest" type="text" bind:value={lowestStr} on:change={handleLowestChange}>

    <label for="highest">Highest</label>
    <input id="highest" type="text" bind:value={highestStr} on:change={handleHighestChange}>
{/if}

