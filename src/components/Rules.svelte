<script lang="ts">
    import { createEventDispatcher } from "svelte";
    import { fade } from 'svelte/transition';
    import ReccomendedButton from "../components/Generic/Buttons/ReccomendedButton.svelte";
    import type { task } from "../lib/gameplay/curriculum/task";
    import { describeHand } from "../lib/gameplay/curriculum/task";
    import { modeName } from "../lib/gameplay/mode/mode";

    export let currentTask: task;
    export let nextable;

    let dispatch = createEventDispatcher()

    function handleNext() {
        dispatch("next")
    }
</script>

<style lang="scss">
    mark {
        background-color: #FFA800;
    }

    .centerer {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: space-between;
        height: 100%;

        .descParent {
            display: flex;
            flex-direction: column;
            align-items: center;
            .taskDesc {
                display: flex;
    
                p {
                    margin: 0 15px 0 15px;
                }
            }
        }

        div {
            flex-grow: 0;
        }
        

        .textCenterer {
            display: flex;
            flex-direction: column;
            align-items: center;
            h3 {
                align-self: center;
                text-align: center;
                padding: 0 30px 0 30px;
            }
            .button {
                padding: 0 0 15px 0;
            }
        }

    }
</style>

<div class="centerer">
    <div class="descParent">
        <h2>{currentTask.lessonURL}</h2>
        <div class="taskDesc">
            <p>Bars {currentTask.startBar}-{currentTask.endBar}</p>
            <p>{describeHand(currentTask.hand)}</p>
            <p>{currentTask.mode.description()}</p>
        </div>
    </div>
    <div class="textCenterer">
        {#if currentTask.mode.modeName() == modeName.wait}
            <h3>Tap the <mark>orange</mark> keys at your own pace</h3>
        {:else}
            <h3>Play the keys as the notes reach them</h3>
        {/if}
        <div class="button" on:click={handleNext}>
            {#if nextable}
                <div in:fade>   
                    <ReccomendedButton text="Start" ></ReccomendedButton>
                </div>
            {/if}
        </div>
    </div>
    <div></div> <!-- ghost :) -->
</div>