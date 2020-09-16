<script>
    import Bar from "./Bar.svelte"
    import Seeker from "./Seeker.svelte"
    import { createEventDispatcher } from 'svelte';

    import { setWidths, validate, getSeekPixels, getSeekPercentage } from "./bars.js"
    import { getRelativePosition } from "../../utils/dom.js"
    import { widthSum } from "../../utils/util.js"
    import { onMount } from 'svelte';

    export let bars;
    export let zoomStart = 0;
    export let zoomEnd = 1;
    export let position = 0;
    
    let w;
    let container;
    let adjustedBars = [];
    $: {
        if (bars !== undefined && w !== undefined) {
            adjustedBars = setWidths(bars, w, zoomStart, zoomEnd).bars;
        }
    }

    onMount(async () => {
        w = document.getElementById("barlines").clientWidth;
    })

    const dispatch = createEventDispatcher();
    function handleClick(event) {
        let pos = getRelativePosition(event.clientX, event.clientY, container)
        position = getSeekPercentage(pos.x -10, w, zoomStart, zoomEnd)
        dispatch('seek', {
			position: position,
		});
    }

    // send repeat positions up to the audio player 
    let startRepeatRatio;
    let endRepeatRatio;
    $: {
        let length = widthSum(bars)
        let start = widthSum(bars.slice(0, find("s", bars)))
        let end = widthSum(bars.slice(0, find("e", bars)))
        if (startRepeatRatio != start && endRepeatRatio != end) {
            dispatch('repeat', {
                start: start/length,
                end: end/length,
            })
        }
    }

    let startedAt;
    function handleDragEnter(barNum) {
        return () => {
            if (startedAt !== undefined && barNum != startedAt) {
                if (startBeforeEnd(bars, startedAt, barNum)) { // can't move the start before the end
                    bars[barNum-1].type = bars[startedAt-1].type
                    bars[startedAt-1].type = ""
                    startedAt = barNum;
                }
            }
        }
    }

    function handleDragStart(barNum) {
        return () => {
            startedAt = barNum
        }
    }

    // find index of a bar of a given type amongst a set of bars
    function find(type, someBars) {
        for (let i = 0; i < someBars.length; i++) {
            if (someBars[i].type == type){
                return i
            }                
        }
        throw new Error("couldn't find " + type + " repeat")
    }

    function startBeforeEnd(allBars, from, to) {
        from -= 1
        to -= 1

        let type = allBars[from].type
        let start
        let end
        if (type == "") {
            throw new Error("type checking with invalid type")
        }
        if (type == "s") {
            start = to
            end = find("e", allBars)
        }
        if (type == "e") {
            start = find("s", allBars)
            end = to
        }
        return start < end
    }
</script>

<style>
    #barlines {
        width: 100%;
        display: flex;
        justify-content: flex-start;
    }

    .barholder {
        height: 50px;
        display: inline-block;
        margin-bottom: 15px;
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

    .seekerHolder {
        position: relative;
        height: 10px;
        width: 20px;
        top: 2px;
        left: var(--left-position);
        z-index: 1;
    }
</style>

<div class="container" on:click={handleClick} bind:this={container}>
    {#if zoomStart <= position && position <= zoomEnd}
        <div class="seekerHolder" style="--left-position: {getSeekPixels(position, w, zoomStart, zoomEnd)+"px"}">
            <Seeker></Seeker>
        </div>
    {:else}
        <div class="seekerHolder"></div> <!-- Gives bars constant height regardless of whether seeker is in zoom -->
    {/if}
    <div class="crossline"></div>
    <div id="barlines" bind:clientWidth={w}>
        {#if w !== undefined}
            {#each adjustedBars as bar, i}
                <div class="barholder" style={"width:" + bar.width + "px"} on:dragenter={handleDragEnter(bar.number)} on:dragstart={handleDragStart(bar.number)}>
                    {#if i != adjustedBars.length - 1}  <!-- final bar should not render its barline -->
                        {#if bar.type === ""}
                            <p class="barnumber default">{bar.number}</p>
                        {:else if bar.type === "s"}
                            <p class="barnumber start">{bar.number}</p>
                        {:else}
                            <p class="barnumber end">{bar.number}</p>
                        {/if}
                    {/if}
                    <Bar type={bar.type}></Bar>
                </div>
            {/each}
        {/if}
    </div>
    {#if validate(bars) != ""}
        <!-- TODO: consistent error display component, e.g., pop up -->
        <p class="errordisplay">Could not render barlines: {validate(bars)}</p>
    {/if}
</div>