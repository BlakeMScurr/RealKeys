<script lang="ts">
    import { stores } from "@sapper/app";
    import { onMount } from "svelte";
    import ReccomendedButton from "../components/Generic/Buttons/ReccomendedButton.svelte";
    import Piano from "../components/pianoroll/piano/Piano.svelte";
    import { lessons } from "../lib/lesson/data";
    import { urlToTask, speed } from "../lib/lesson/lesson";
    import { NewNote, notesBetween } from "../lib/music/theory/notes";
    import { newPiano } from "../lib/track/instrument";
    import Loader from "../components/loader/Loader.svelte"

    const { page } = stores();
    const query = $page.query;
    let task = urlToTask(query)

    if (!lessons.has(task.lesson)) {
        throw new Error(`No lesson called ${task.lesson}`)
    }

    // required as trying to creating instruments requires window.AudioContext, and errors in preprocessing on the server
    let piano
    let loading = true
    onMount(() => {
        piano = newPiano("User Piano", ()=>{loading = false})
    })
</script>

<style lang="scss">
    mark {
        background-color: #FFA800;
    }

    .centerer {
        height: calc(100% - 50px); // whole page - nav
        display: flex;
        flex-direction: column;

        .shawty {
            flex-basis: 15%;
            flex-grow: 1;
        }
        .taskDesc {
            display: flex;

            p {
                margin: 0 15px 0 15px;
            }
        }

        div {
            align-self: center;
            height: 100%;
            flex: 0 1 auto;
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
            margin: 0 0 15px 0;
        }
        .piano {
            position: relative;
            flex: 1 1 auto;
            flex-grow: 5;
            width: 100%;
        }
    }

    .loading {
        position: absolute;
        z-index: 15;
        height: 0;
        top: calc(50% - 75px); // centred, given ~150 width loading icon
        left: calc(50% - 75px);
    }

</style>

<div class="centerer">
    <h2>{task.lesson}</h2>
    <div class="taskDesc shawty">
        <p>Bars {task.startBar}-{task.endBar}</p>
        <p>{task.hand}</p>
        <p>{task.speed}</p>
    </div>
    <div class="shawty textCenterer">
        {#if task.speed === speed.OwnPace}
            <h3>Play the <mark>orange highlighted</mark> keys as the notes reach the keys</h3>
        {:else}
            <h3>Play the <mark>orange highlighted</mark> keys at your own pace</h3>
        {/if}
    </div>
    <div class="button shawty">
        <ReccomendedButton text="Start"></ReccomendedButton>
    </div>
    <div class="piano">
        <Piano keys={ notesBetween(NewNote("C", 4), NewNote("C", 5)) } sandbox={true} instrument={piano}></Piano>
        {#if loading}
            <div class="loading">
                <Loader></Loader>
            </div>
        {/if}
    </div>
</div>
