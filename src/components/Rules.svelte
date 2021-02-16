<script lang="ts">
    import { createEventDispatcher } from "svelte";
    import { fade } from 'svelte/transition';
    import ReccomendedButton from "../components/Generic/Buttons/ReccomendedButton.svelte";
    import { speed } from "../lib/lesson/lesson";

    export let task;
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

    .teller {
        position: fixed;
    }
</style>

<div class="centerer">
    <div class="descParent">
        <h2>{task.lesson}</h2>
        <div class="taskDesc">
            <p>Bars {task.startBar}-{task.endBar}</p>
            <p>{task.hand}</p>
            <p>{task.speed}</p>
        </div>
    </div>
    <div class="textCenterer">
        {#if task.speed === speed.OwnPace}
            <h3>Tap the <mark>orange</mark> keys at your own pace</h3>
        {:else}
            <h3>As the notes reach the keys, play the keys</h3>
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