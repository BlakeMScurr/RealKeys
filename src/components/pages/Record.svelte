<!-- TODO: delete this useless file -->
<script lang="ts">
    import { TimedNotes } from "../../lib/music/timed/timed.ts";
    import { castTimedNotes, castBars } from "../../lib/cast.ts"
    import type { Player } from "../audioplayer/AudioPlayer.ts";
    import PianoRoll from "../pianoroll/PianoRoll.svelte";
    import ZoomBars from "../bars/zoom/ZoomBars.svelte";
    import AudioPlayer from "../audioplayer/AudioPlayer.svelte";

    export let bars;
    export let AudioPlayerPromise:Promise<Player>;
    export let notes:TimedNotes = new TimedNotes([]);
    let bs = castBars(bars)
</script>

<AudioPlayer {AudioPlayerPromise}></AudioPlayer>
<ZoomBars bars={bars}></ZoomBars>
<PianoRoll bars={bs} notes={castTimedNotes(notes)}></PianoRoll>