<script>
    import Bar from "../components/Bar.svelte"
    import { onMount } from 'svelte';

    export let bars = ["s", "e"];
    
    let w;

    onMount(async () => {
        w = document.getElementById("barlines").clientWidth;
    })

    // TODO: move this to well unit tested typescript file
    // TODO: rename, since this determines widths and autocorrects
    // TODO: refactor to be far less lenient and instead show an issue/apology/communication screen - this is necessary for fast feedback and development improvement
    function validate(bars, width) {
        let validBars = bars.slice()
        let barLineTypes = validBars.map(bar => bar.type)
        let lengthsAfterBarLine = validBars.map(bar => bar.length)

        // ensure the time after the last bar line is zero
        if (lengthsAfterBarLine != 0) {
            lengthsAfterBarLine[lengthsAfterBarLine.length-1] = 0
        }

        // ensure the lengths of the bars sum to 1
        let totalLength = lengthsAfterBarLine.reduce((a,b) => a + b, 0)
        
        if (totalLength < 1) {
            // add required extra length to the last bar
            console.warn("bar length total too short")
            lengthsAfterBarLine[lengthsAfterBarLine.length - 2] += 1 - totalLength
        } else if (totalLength > 1) {
            console.warn("bar length total too long")
            // if the last bar is larger than the excess, remove from excess the last bar
            if (lengthsAfterBarLine[lengthsAfterBarLine.length - 2] > totalLength - 1) {
                lengthsAfterBarLine[lengthsAfterBarLine.length - 2] -= totalLength - 1
            } else {
                throw new Error("total bar lengths too long to truncate final bar: " + totalLength)
            }
        }

        totalLength = lengthsAfterBarLine.reduce((a,b) => a + b, 0)
        if (totalLength != 1) {
            throw new Error("total bar length still not 1: " + totalLength)
        }


        // Fix missing start/ends
        let starts = getAllIndices(barLineTypes, "s")
        let ends = getAllIndices(barLineTypes, "e")
        if (starts.length == 0) {
            console.warn("missing start repeat")
            barLineTypes[0] = "s"
        }
        if (ends.length == 0) {
            console.warn("missing end repeat")
            barLineTypes[barLineTypes.length - 1] = "e"
        }

        // Fix multiple starts/ends
        if (starts.length > 1) {
            console.warn("extra start repeats at " + starts.slice(1).toString())
            starts.slice(1).forEach((i) => {
                barLineTypes[i] = ""
            })
        }
        if (ends.length > 1) {
            ends.reverse()
            console.warn("extra end repeats at ", ends.slice(1).toString())
            ends.slice(1).forEach((i) => {
                barLineTypes[i] = ""
            })
        }
        
        // Fix switched start/ends
        let start = barLineTypes.indexOf("s")
        let end = barLineTypes.indexOf("e")
        if (start > end) {
            barLineTypes[start] = "e"
            barLineTypes[end] = "s"
        }

        // remove the width of the last barline
        switch (barLineTypes[barLineTypes.length-1]) {
            case "e":
                width -= 25 // end bars have width 25
                lengthsAfterBarLine[lengthsAfterBarLine.length-1] = 25 / width
                break;
            case "":
                width -= 1 // regular bars have width 1
                lengthsAfterBarLine[lengthsAfterBarLine.length-1] = 1 / width
                break;
            default:
                throw new Error("invalid final bar: " + barLineTypes[barLineTypes.length-1])
        }

        return barLineTypes.map((type, i) => {
            let barWidth = lengthsAfterBarLine[i] * width
            // TODO: for some reason, on the real page (not storybook) if we set the width to an invalid value rather than 25px
            // it will remain 25px (due to the leftover space for it) and it will suddenly stop spilling over to the next line, despite
            // not having changed width
            if (i == lengthsAfterBarLine.length - 1) { barWidth = "remander"} 
            return {
                type: type,
                width: barWidth,
            }
        })
    }

    function getAllIndices(arr, val) {
        var indices = [], i;
        for(i = 0; i < arr.length; i++)
            if (arr[i] === val)
                indices.push(i);
        return indices;
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
    }

    .crossline { /* TODO: lower crossline z-index so the cursor to move the barline still exists on the cross line */
        position: relative;
        background-color: BLACK;
        height: 2px;
        top: 25px;
        width: 100%;
        z-index: 1;
    }
</style>

<div class="container">
    <div class="crossline"></div>
    <div id="barlines" bind:clientWidth={w}> <!-- TODO: why did bind:clientWidth={w} give NaN? -->
        {#if w !== undefined}
            {#each validate(bars, w) as bar}
                <div class="barholder" style={"width:" + bar.width + "px"}>
                    <Bar type={bar.type}></Bar>
                </div>
            {/each}
        {/if}
    </div>
</div>