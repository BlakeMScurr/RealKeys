<script lang="ts">
    import { createEventDispatcher } from "svelte";
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
        height: 100%;

        .taskDesc {
            display: flex;

            p {
                margin: 0 15px 0 15px;
            }
        }

        div {
            height: 100%;
            flex-grow: 0;
        }
        

        .textCenterer {
            display: flex;
            h3 {
                align-self: center;
                text-align: center;
                padding: 0 30px 0 30px;
            }
        }

        .button {
            padding: 0 0 15px 0;
        }
    }
</style>

<div class="centerer">
    <h2>{task.lesson}</h2>
    <div class="taskDesc">
        <p>Bars {task.startBar}-{task.endBar}</p>
        <p>{task.hand}</p>
        <p>{task.speed}</p>
    </div>
    <div class="textCenterer">
        {#if task.speed === speed.OwnPace}
        <h3>Play the <mark>orange highlighted</mark> keys as the notes reach the keys</h3>
        {:else}
        <h3>Play the <mark>orange highlighted</mark> keys at your own pace</h3>
        {/if}
    </div>
    {#if nextable}
        <div class="button" on:click={handleNext}>
            <ReccomendedButton text="Start" ></ReccomendedButton>
        </div>
    {/if}
</div>