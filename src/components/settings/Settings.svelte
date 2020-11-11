<script lang="ts">
    import { songDuration, tracks } from "../../stores/stores"
    import type { Bar } from "../bars/bars"
    import { NewNote } from "../../lib/music/theory/notes"
    import { newClicker } from "../track/clicker"
    import { TimedNote } from "../../lib/music/timed/timed";

    export let bars: Array<Bar>;

    let clickTrackOn:boolean = true
    let clicker = newClicker().genericise("Lesson Playback")
    $: {
        if (clickTrackOn) {
            clicker.setVolume(1)
        } else {
            clicker.setVolume(0)
        }
    }

    let currPos = 0;
    let notes = bars.map((bar) => {
        let oldPos = currPos
        currPos += bar.width
        return new TimedNote(oldPos, oldPos + 0.1, NewNote("A", 4))
    })

    let noteSubscriber = tracks.newPlaybackTrack(notes, clicker)
</script>

<label for="clickTrackOn">Click Track</label>
<input type="checkbox" id="clickTrackOn" bind:checked={clickTrackOn}>