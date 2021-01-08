<script lang="ts">
    import { createEventDispatcher } from 'svelte';

    export let list: Map<string, any> = new Map();
    export let outsideSelector;

    let dispatch = createEventDispatcher();

    let keys = Array.from(list.keys())
    $: keys = Array.from(list.keys())

    let selected;
    $: {
        if (selected !== undefined) {
            dispatch("select", {key: selected, value: list.get(selected), index: keys.indexOf(selected)})
        }
    }

    if (outsideSelector != undefined) {
        outsideSelector((i)=>{
            if (keys !== undefined) {
                selected = keys[i]
            }
        })
    }
</script>

<!-- TODO: stylise appropriately -->
    
<form>
    <select name="items" bind:value={selected}>
        {#each keys as key}
            <option value={key}>{key}</option>
        {/each}
    </select>
</form>