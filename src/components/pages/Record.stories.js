import Record from './Record.svelte';
import { even } from "../bars/bars.ts";
import { TimedNotes } from "../../lib/music/timed/timed.ts";
import { NewHowlAudioPlayer } from '../audioplayer/audioplayer';
import { firework } from '../audioplayer/firework'

export default {
  title: 'Record',
  excludeStories: /.*Data$/,
};

export const Default = () => ({
    Component: Record,
    props: {
        bars: even(["s", "", "", "","", "", "","", "", "","", "", "","", "", "","", "", "","", "", "","", "", "","", "", "","", "", "","", "", "","", "", "", "e"]),
        notes: new TimedNotes([]),
        AudioPlayerPromise: NewHowlAudioPlayer(firework),
    }
})