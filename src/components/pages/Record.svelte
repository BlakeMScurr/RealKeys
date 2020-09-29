<!-- TODO: delete this useless file -->
<script lang="ts">
    import { TimedNotes } from "../../lib/music/timed/timed.ts";
    import { castTimedNotes } from "../../lib/cast.ts"
    import { Bars } from "../pianoroll/pianoroll.ts";
    import type { Player } from "../audioplayer/AudioPlayer.ts";
    import PianoRoll from "../pianoroll/PianoRoll.svelte";
    import ZoomBars from "../bars/zoom/ZoomBars.svelte";
    import AudioPlayer from "../audioplayer/AudioPlayer.svelte";

    export let bars;
    export let AudioPlayerPromise:Promise<Player>;
    export let notes:TimedNotes = new TimedNotes([]);

    // TODO: reconcile the two bar types by replacing them with a new type that is fractional and specifies start and end
    let barwidths = new Bars(bars.map((bar)=>{
        return bar.width
    }))
</script>

<AudioPlayer {AudioPlayerPromise}></AudioPlayer>
<ZoomBars {bars}></ZoomBars>
<PianoRoll bars={barwidths} notes={castTimedNotes(notes)}></PianoRoll>