<script lang="ts">
    import type { TimedNote } from "../../lib/music/timed/timed";
    import type { InertTrack } from '../track/instrument';
    import { tracks } from "../../stores/stores"
    import { createEventDispatcher } from 'svelte';

    export let clicks: Array<TimedNote>;
    export let trackMap: Map<string, InertTrack>;

    let dispatch = createEventDispatcher();

    trackMap.forEach((track)=>{
        let playbackTrack = tracks.newPlaybackTrack(track.notes.notes, track.instrument)
        playbackTrack.subscribeToNotes((notes: Map<string, string>)=>{
            let state = new Map<string, string>();
            notes.forEach((noteState, noteName: string)=>{
                state.set(noteName, noteState)
            })
            dispatch("notestate", {track: track.instrument.name, state: state})
        })
    })
</script>

<p>Settings</p>