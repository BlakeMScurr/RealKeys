<script>
    export let bpm = 0;

    let inputDisabled
    let enablerTimeout
    let tapStamps = [] // times at which we tapped
    const timeToReset = 2000 // milliseconds
    function tap() {
        // prevent input field being messed with as we're tapping
        inputDisabled = "disabled"
        clearTimeout(enablerTimeout)
        enablerTimeout = setTimeout(() => {
            inputDisabled = ""
        }, timeToReset);

        // add most recent tap
        let currentTime = Date.now()
        if (tapStamps.length > 0 && currentTime - tapStamps[tapStamps.length-1] > timeToReset) {
            tapStamps = []
        }
        tapStamps.push(currentTime)

        // calculate bpm
        if (tapStamps.length > 1) {
            let tapLength = (tapStamps[tapStamps.length-1] - tapStamps[0])/(tapStamps.length-1) // length from first to last taps divided across all the taps but the last, which hasn't finished yet
            bpm = Math.round(60/(tapLength/1000)*10)/10
        }
    }
</script>

<style>
    button {
        float: left;
        margin-right: 5px
    }
</style>

<button on:click={tap}>BPM</button>
<input type="number" bind:value={bpm} disabled={inputDisabled}>