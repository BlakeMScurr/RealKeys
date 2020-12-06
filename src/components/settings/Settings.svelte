<script lang="ts">
    import { tracks } from "../../stores/stores"
    import { highClick, lowClick, newClicker } from "../track/instrument"
    import { TimedNote, TimedNotes } from "../../lib/music/timed/timed";

    export let bars;
    export let timesignatures;

    let barLength = timesignatures[0].timeSignature[1]

    function makeClicks(bars):Array<TimedNote> {
        let currPos = 0;
        let i = 0
        // TODO: use for loop
        let clicks = bars.map((bar) => {
            let oldPos = currPos
            currPos += bar
            let note = i % barLength == 0 ? highClick : lowClick
            i++
            return new TimedNote(oldPos, oldPos + 0.1, note)
        })
        console.log(clicks)
        return clicks
    }

    let clickTrackOn:boolean = true
    let clicker = newClicker("Click Track")
    $: {
        if (clickTrackOn) {
            clicker.setVolume(1)
        } else {
            clicker.setVolume(0)
        }
    }

    let track = tracks.newPlaybackTrack(makeClicks(bars.bars), clicker)

    $: {
        track.updateNotes(new TimedNotes(makeClicks(bars.bars)))
    }

</script>

<label for="clickTrackOn">Click Track</label>
<input type="checkbox" id="clickTrackOn" bind:checked={clickTrackOn}>