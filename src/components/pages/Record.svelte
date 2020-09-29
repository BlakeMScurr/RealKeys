<script lang="ts">
    import { TimedNotes, TimedNote } from "../../lib/music/timed/timed.ts";
    import { NewNote } from "../../lib/music/theory/notes.ts";
    import { Bars } from "../pianoroll/pianoroll.ts";
    import type { Player } from "../audioplayer/AudioPlayer.ts";
    import PianoRoll from "../pianoroll/PianoRoll.svelte";
    import ZoomBars from "../bars/zoom/ZoomBars.svelte";
    import AudioPlayer from "../audioplayer/AudioPlayer.svelte";

    export let bars;
    export let AudioPlayerPromise:Promise<Player>;
    export let notes:TimedNotes = new TimedNotes([]);

    // TODO: find the proper way to cast
    let ns:Array<TimedNote> = []
    notes.notes.forEach(note => {
        let notestr = note.note.abstract.letter + (note.note.abstract.accidental ? "#":"")
        let nn = NewNote(notestr, note.note.abstract.octave)
        ns.push(new TimedNote(note.start, note.end, nn))
    });

    let tns = new TimedNotes(ns)

    // TODO: reconcile the two bar types by replacing them with a new type that is fractional and specifies start and end
    let barwidths = new Bars(bars.map((bar)=>{
        return bar.width
    }))
</script>

<AudioPlayer {AudioPlayerPromise}></AudioPlayer>
<ZoomBars {bars}></ZoomBars>
<PianoRoll bars={barwidths} notes={tns}></PianoRoll>