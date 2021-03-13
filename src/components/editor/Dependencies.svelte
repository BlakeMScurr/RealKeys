<script lang="ts">
    import { rightClickEvent } from "../../lib/util";
    import { createEventDispatcher } from "svelte";

    export let curriculae: Array<string> = new Array<string>();
    export let deps: Array<[number, number]> = new Array<[number, number]>();
    
    let holding = null
    let selected = 0

    let dispatch = createEventDispatcher()

    function drop(i) {
        return () => {
            let tmp = curriculae[holding]
            curriculae[holding] = curriculae[i]
            curriculae[i] = tmp
            curriculae = curriculae
        }
    }

    function click(i) {
        return (e) => {
            selected = i
            dispatch("select", curriculae)
        }
    }

    function addDep(i) {
        return (e) => {
            e.stopPropagation()
            deps.push([selected, i])
            deps = deps
        }
    }

    function removeDep(i) {
        return () => {
            deps.splice(i, 1)
            deps = deps
        }
    }
</script>

<style lang="scss">
    .curriculumHolder {
        display: grid;
        grid-template-columns: repeat(5, 1fr);
        grid-gap: 14px;
        padding: 14px;

        .curriculum {
            background-color: #eee;
        }

        .selected {
            background-color: #bbb;
        }
    }

    .depHolder {
        display: grid;
        grid-template-columns: repeat(8, 1fr);
        grid-gap: 14px;
        padding: 14px;

        .dep {
            background-color: #eee;
        }
    }
</style>

<div class="curriculumHolder">
    {#each curriculae as curriculum, i}
        <div draggable={true}
            on:drop={drop(i)}
            on:dragover={e => e.preventDefault()}
            on:dragenter={e => e.preventDefault()}
            on:dragstart={() => holding = i}

            on:click={click(i)}
            class="curriculum {i===selected? "selected": ""}">
            {curriculum}

            {#if i !== selected}
                <button on:click={addDep(i)}>Add Dep</button>
            {/if}
        </div>
    {/each}
</div>

<div class="depHolder">
    {#each deps as dep, i}
        <div class="dep">
            <p>{curriculae[dep[0]]} -> {curriculae[dep[1]]}</p>
            <button on:click={removeDep(i)}>Delete</button>
        </div>
    {/each}
</div>