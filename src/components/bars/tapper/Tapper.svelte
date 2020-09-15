<script>
    import { bpmFromTaps } from "../../../backend/beatcalculation/beatcalculation.js"

    export let bpm = 0;
    export let tapTimes = []; // length of each bar in milliseconds


    let recording;
    $: inputDisabled = recording ? "disabled" : ""
    let inputDisabled
    let enablerTimeout
    let tapStamps = [] // times at which we tapped
    const timeToReset = 2000 // milliseconds
    function tap() {
        // prevent input field being messed with as we're tapping
        recording = true
        clearTimeout(enablerTimeout)
        enablerTimeout = setTimeout(() => {
            recording = false
        }, timeToReset);

        // add most recent tap
        let currentTime = Date.now()
        if (tapStamps.length > 0 && currentTime - tapStamps[tapStamps.length-1] > timeToReset) {
            tapStamps = []
            tapTimes = []
        }
        tapStamps.push(currentTime)

        // push out beat times
        let tt = []
        for (let i = 1; i < tapStamps.length; i++) {
            tt.push(tapStamps[i]-tapStamps[i-1])
        }
        tapTimes = tt

        // calculate bpm
        if (tapStamps.length > 1) {
            bpm = bpmFromTaps(tapStamps)
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