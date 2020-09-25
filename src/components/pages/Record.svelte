<script lang="ts">
    import { TimedNotes } from "../../lib/music/timed/timed.ts";
    import { Bars } from "../pianoroll/pianoroll.ts";
    import PianoRoll from "../pianoroll/PianoRoll.svelte";
import ZoomBars from "../bars/zoom/ZoomBars.svelte";

    export let bars;
    export let notes = new TimedNotes([]);

    // TODO: reconcile the two bar types by replacing them with a new type that is fractional and specifies start and end
    let barwidths = new Bars(bars.map((bar)=>{
        return bar.width
    }))
</script>

<!-- TODO: audioplayer -->
<ZoomBars {bars}></ZoomBars>
<PianoRoll bars={barwidths} {notes}></PianoRoll>