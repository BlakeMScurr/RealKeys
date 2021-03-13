<script lang="ts">
    import { createEventDispatcher } from "svelte";
    import { graph } from "../../lib/math/graph";

    export let curriculae: Array<string> = new Array<string>();
    export let deps: Array<[number, number]> = new Array<[number, number]>();

    $: internalCurriculae = curriculae.slice()
    
    let holding = null
    let selected = 0

    let dispatch = createEventDispatcher()

    function drop(i) {
        return () => {
            let tmp = internalCurriculae[holding]
            internalCurriculae[holding] = internalCurriculae[i]
            internalCurriculae[i] = tmp

            deps.forEach((dep: [number, number]) => {
                if (dep[0] === holding) {
                     dep[0] = i
                } else if (dep[0] === i) {
                     dep[0] = holding
                }
                if (dep[1] === holding) {
                     dep[1] = i
                } else if (dep[1] === i) {
                     dep[1] = holding
                }
            }) 
            deps = deps
            internalCurriculae = internalCurriculae
            dispatch("edit", { deps: deps, order: internalCurriculae})
        }
    }

    function click(i) {
        return (e) => {
            selected = i
            dispatch("select", internalCurriculae)
        }
    }

    function addDep(i: number) {
        return (e) => {
            e.stopPropagation()
            let newDep: [number, number] = [selected, i]
            try {
                deps.forEach((dep: [number, number]) => {
                    if (newDep[0] === dep[0] && newDep[1] === dep[1]) {
                        throw new Error("dep already exists")
                    }
                })

                let x = deps.slice()
                x.push(newDep)
                new graph(x).dag()
                deps.push(newDep)
            } catch (e) {
                console.warn(e)
            }
            deps = deps
            dispatch("edit", { deps: deps, order: internalCurriculae})
        }
    }

    function removeDep(i) {
        return () => {
            deps.splice(i, 1)
            deps = deps
            dispatch("edit", { deps: deps, order: internalCurriculae})
        }
    }

    let showDeps = true
</script>

<style lang="scss">
     .depHolder {
        display: grid;
        grid-template-columns: repeat(8, 1fr);
        grid-gap: 14px;
        padding: 14px;

        .dep {
            background-color: #eee;
        }
    }

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
</style>

<h1>Sections</h1>

<div class="curriculumHolder">
    {#each internalCurriculae as curriculum, i}
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

<h1>Dependencies</h1>
<label for="showdeps">show</label>
<input id="showdeps" type="checkbox" bind:checked={showDeps}>

{#if showDeps}
    <!-- TODO: render deps as a graph directly -->
    <div class="depHolder">
        {#each deps as dep, i}
            <div class="dep">
                <p>{internalCurriculae[dep[0]]} -> {internalCurriculae[dep[1]]}</p>
                <button on:click={removeDep(i)}>Delete</button>
            </div>
        {/each}
    </div>
{/if}