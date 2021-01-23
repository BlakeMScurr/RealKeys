<script lang="ts">
    import { stores } from "@sapper/app";
    import ReccomendedButton from "../components/Generic/Buttons/ReccomendedButton.svelte";
    import Piano from "../components/pianoroll/piano/Piano.svelte";
    import { lessons } from "../lib/lesson/data";
    import { urlToTask, speed } from "../lib/lesson/lesson";
    import { NewNote, notesBetween } from "../lib/music/theory/notes";

    const { page } = stores();
    const query = $page.query;
    let task = urlToTask(query)

    if (!lessons.has(task.lesson)) {
        throw new Error(`No lesson called ${task.lesson}`)
    }

    // TODO: remove hack
    class hack {
        subscribe
        constructor(){
            this.subscribe = (f) => {
                f(false)
                return ()=>{}
            }
        }
    }
</script>

<style lang="scss">
    .taskDesc {
        display: flex;
        justify-content: center;

        p {
            margin: 0 15px 0 15px;
        }
    }

    mark {
        background-color: #FFA800;
    }

    .centerer {
        height: 100%;
        display: flex;
        flex-direction: column;

        div {
            align-self: center;
            height: 100%;
            flex: 0 1 auto;
        }
        
        .shawty {
            flex-basis: 15%;
            flex-grow: 1;
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

</style>

<h2>{task.lesson}</h2>

<div class="taskDesc">
    <p>Bars {task.startBar}-{task.endBar}</p>
    <p>{task.hand}</p>
    <p>{task.speed}</p>
</div>

<div class="centerer">
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
        <Piano keys={ notesBetween(NewNote("C", 4), NewNote("C", 5)) } playing={ new hack() } waitMode={ new hack() }></Piano>
    </div>
</div>
