<script>
    import Bar from "../components/Bar.svelte"

    export let bars = ["s", "e"];

    // TODO: move this to well unit tested typescript file
    function validate(bars) {
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

        return barLineTypes
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

    .crossline { /* TODO: lower crossline z-index so the cursor to move the barline still exists on the cross line */
        position: relative;
        background-color: BLACK;
        height: 2px;
        top: 25px;
        width: 100%;
    }
</style>

<div class="container">
    <div class="crossline"></div>
    <div id="barlines">
        {#each validate(bars) as type}
            <Bar {type}></Bar>
        {/each}
    </div>
</div>