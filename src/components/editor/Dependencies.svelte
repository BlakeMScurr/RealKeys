<script lang="ts">
    import { createEventDispatcher } from "svelte";
    import { graph } from "../../lib/math/graph";

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

            console.log(JSON.stringify(deps))
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
            console.log(JSON.stringify(deps))
            deps = deps
            console.log(JSON.stringify(deps))
            curriculae = curriculae
        }
    }

    function click(i) {
        return (e) => {
            selected = i
            dispatch("select", curriculae)
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

<!-- TODO: render deps as a graph directly -->
<div class="depHolder">
    {#each deps as dep, i}
        <div class="dep">
            <p>{curriculae[dep[0]]} -> {curriculae[dep[1]]}</p>
            <button on:click={removeDep(i)}>Delete</button>
        </div>
    {/each}
</div>