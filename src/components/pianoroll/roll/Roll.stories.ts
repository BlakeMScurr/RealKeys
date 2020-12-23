import Roll from './Roll.svelte';
import { TimedNote, TimedNotes } from "../../../lib/music/timed/timed";
import { Bars }  from "../pianoRollHelpers";
import { NewNote, notesBetween } from "../../../lib/music/theory/notes";

export default {
  title: 'Roll',
};

export const Pixi = () => {
  return {
    Component: Roll,
    props: {
      debugSliders: true,
      position: 0,
      zoomWidth: 0.5,
      keys: notesBetween(NewNote("C", 4), NewNote("C", 5)),
      songDuraion: { subscribe: (cb)=>{
        cb(10000)
      }},
      height: 500,
      unit: "px",
      bars: new Bars([0.2, 0.2, 0.2, 0.2, 0.2]),
      notes: new TimedNotes([
        // Picardy
        new TimedNote(0, 0.4, NewNote("C", 4)),
        new TimedNote(0, 0.4, NewNote("F", 4)),
        new TimedNote(0, 1, NewNote("G", 4)),
        
        // Moving "Third"
        new TimedNote(0.4, 0.6, NewNote("C", 4)),
        new TimedNote(0.4, 0.6, NewNote("D", 4)),
        new TimedNote(0.6, 0.8, NewNote("C", 4)),
        new TimedNote(0.6, 0.8, NewNote("Eb", 4)),
        new TimedNote(0.8, 1, NewNote("C", 4)),
        new TimedNote(0.8, 1, NewNote("E", 4)),
      ]),
      overlayNotes: new TimedNotes([]),
      recording: true,
    },
  }
}