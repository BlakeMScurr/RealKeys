<script lang="ts">
    import { createEventDispatcher } from 'svelte';

    export let list: Map<string, any> = new Map();

    let dispatch = createEventDispatcher();

    function getAll(iterator) {
        let values = []
        let next = iterator.next()
        while (!next.done) {
            values.push(next.value)
            next = iterator.next()
        }
        return values
    }

    $: keys = getAll(list.keys())

    let selected;
    $: {
        if (selected !== undefined) {
            dispatch("select", list.get(selected))
        }
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