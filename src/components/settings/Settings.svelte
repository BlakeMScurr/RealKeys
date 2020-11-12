<script lang="ts">
    import { tracks } from "../../stores/stores"
    import { newClicker } from "../track/clicker"
    import type { TimedNote } from "../../lib/music/timed/timed";

    export let clicks: Array<TimedNote>;

    let clickTrackOn:boolean = true
    let clicker = newClicker("Click Track")
    $: {
        if (clickTrackOn) {
            clicker.setVolume(1)
        } else {
            clicker.setVolume(0)
        }
    }

    let track = tracks.newPlaybackTrack(clicks, clicker)

    $: {
        track.updateNotes(clicks)
    }

</script>

<label for="clickTrackOn">Click Track</label>
<input type="checkbox" id="clickTrackOn" bind:checked={clickTrackOn}>