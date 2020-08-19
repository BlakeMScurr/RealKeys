<script>
    import Bar from "../components/Bar.svelte"

    export let bars;

    function validate(bars) {
        let validBars = bars.slice()
        let starts = getAllIndices(validBars, "s")
        let ends = getAllIndices(validBars, "e")

        // Fix missing start/ends
        if (starts.length == 0) {
            console.warn("missing start repeat")
            validBars[0] = "s"
        }
        if (ends.length == 0) {
            console.warn("missing end repeat")
            validBars[validBars.length - 1] = "e"
        }

        // Fix multiple starts/ends
        if (starts.length > 1) {
            console.warn("extra start repeats at ", starts.slice(1))
            starts.slice(1).forEach((i) => {
                validBars[i] = ""
            })
        }
        if (ends.length > 1) {
            ends.reverse()
            console.warn("extra end repeats at ", ends.slice(1))
            ends.slice(1).forEach((i) => {
                validBars[i] = ""
            })
        }
        
        // Fix switched start/ends
        let start = validBars.indexOf("s")
        let end = validBars.indexOf("e")
        if (start > end) {
            validBars[start] = "e"
            validBars[end] = "s"
        }

        return validBars
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
        justify-content: space-between;
    }

    .crossline {
        position: relative;
        background-color: BLACK;
        height: 2px;
        top: 50px;
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