<script>
    import Bar from "./Bar.svelte"
    import { setWidths, validate } from "./bars.js"
    import { onMount } from 'svelte';

    export let bars = ["s", "e"];
    export let zoomStart = 0;
    export let zoomEnd = 1;
    
    let w;

    onMount(async () => {
        w = document.getElementById("barlines").clientWidth;
    })
</script>

<style>
    #barlines {
        width: 100%;
        display: flex;
        justify-content: flex-start;
    }

    .barholder {
        height: 50px;
    }

    .crossline { /* TODO: lower crossline z-index so the cursor to move the barline still exists on the cross line */
        position: relative;
        background-color: BLACK;
        height: 2px;
        top: 25px;
        width: 100%;
        z-index: 1;
    }

    .barnumber {
        position: absolute;
        margin-top: 0;
        top: -5px;
    }

    .start {
        margin-left: 22px;
    }

    .end {
        margin-left: 30px;
    }

    .default {
        margin-left: 3px;
        top: -3px;
    }

    .errordisplay {
        position: absolute;
        top: 50px;
    }
</style>

<div class="container">
    <div class="crossline"></div>
    <div id="barlines" bind:clientWidth={w}>
        {#if w !== undefined}
            {#each setWidths(bars, w, zoomStart, zoomEnd).bars as bar}
                <div class="barholder" style={"width:" + bar.width + "px"}>
                    {#if bar.type === ""}
                        <p class="barnumber default">{bar.number}</p>
                    {:else if bar.type === "s"}
                        <p class="barnumber start">{bar.number}</p>
                    {:else}
                        <p class="barnumber end">{bar.number}</p>
                    {/if}
                    <Bar type={bar.type}></Bar>
                </div>
            {/each}
            {#if validate(bars) != ""}
                <p class="errordisplay">Could not render barlines: {validate(bars)}</p>
            {/if}
        {/if}
    </div>
</div>