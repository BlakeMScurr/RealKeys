<script lang="ts">
    import type { Synth } from "../track/instrument"
    import type { TimedNote } from "../../lib/music/timed/timed";

    export let clicks: Array<TimedNote>;
    export let clicker: Synth;

    let clickTrackOn:boolean = true
    $: {
        if (clickTrackOn) {
            clicker.setVolume(1)
        } else {
            clicker.setVolume(0)
        }
    }
</script>

<label for="clickTrackOn">Click Track</label>
<input type="checkbox" id="clickTrackOn" bind:checked={clickTrackOn}>