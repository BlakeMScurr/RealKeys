<script lang="ts">
    import type { Player } from "./audioplayer"
    import InternalAudioPlayer from "./InternalAudioPlayer.svelte";
    
    export let AudioPlayerPromise:Promise<Player>;
</script>

{#await AudioPlayerPromise}
    Loading audio
{:then audioPlayer} 
    <InternalAudioPlayer {audioPlayer}></InternalAudioPlayer>
{/await}