<!-- This wrapper exists to show how zoom and position management can work together with audio players -->
<script lang="ts">
    import type { Player } from "./audioplayer"
    import AudioPlayer from "./AudioPlayer.svelte";
    import ZoomBars from "../bars/zoom/ZoomBars.svelte"
    
    export let AudioPlayerPromise:Promise<Player>;
    export let bars;
</script>

<ZoomBars {bars}></ZoomBars>
<AudioPlayer {AudioPlayerPromise}></AudioPlayer>