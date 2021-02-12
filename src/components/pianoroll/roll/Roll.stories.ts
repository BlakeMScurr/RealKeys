import domstoryholder from './domstoryholder.svelte';
import bgstoryholder from './bgstoryholder.svelte';
import { TimedNote, TimedNotes } from "../../../lib/music/timed/timed";
import { Bars }  from "../pianoRollHelpers";
import { NewNote, notesBetween } from "../../../lib/music/theory/notes";
import { Colourer } from '../../colours';

export default {
  title: 'Roll',
};

export const Background = () => {
  return {
    Component: bgstoryholder,
    props: {
      keys: notesBetween(NewNote("C", 4), NewNote("C", 5)),
    },
  }
}


export const DOM = () => {
  return {
    Component: domstoryholder,
    props: {
      debugSliders: true,
      position: 0,
      zoomWidth: 1,
      keys: notesBetween(NewNote("C", 4), NewNote("C", 5)),
      duration: 10000,
      colourer: new Colourer(3),
      height: 500,
      unit: "px",
      bars: new Bars([0.2, 0.2, 0.2, 0.2, 0.2]),
      tracks: new Map<string, TimedNotes>([
        ["track1", new TimedNotes([
          // Picardy
          new TimedNote(0, 0.4, NewNote("C", 4)),
          new TimedNote(0, 0.4, NewNote("F", 4)),
          new TimedNote(0, 1, NewNote("G", 4)),
        ])],
        ["track2", new TimedNotes([
          // Moving "Third"
          new TimedNote(0.4, 0.6, NewNote("C", 4)),
          new TimedNote(0.4, 0.6, NewNote("D", 4)),
          new TimedNote(0.6, 0.8, NewNote("C", 4)),
        ])],
        ["track3", new TimedNotes([
          new TimedNote(0.6, 0.8, NewNote("Eb", 4)),
          new TimedNote(0.8, 1, NewNote("C", 4)),
          new TimedNote(0.8, 1, NewNote("E", 4)),
        ])]
      ]),
      overlayNotes: new TimedNotes([]),
      recording: true,
    },
  }
}
export const SparseDOM = () => {
  return {
    Component: domstoryholder,
    props: {
      debugSliders: true,
      position: 0,
      zoomWidth: 1,
      keys: notesBetween(NewNote("C", 4), NewNote("C", 5)),
      songDuraion: 10000,
      colourer: new Colourer(3),
      height: 500,
      unit: "px",
      bars: new Bars([0.2, 0.2, 0.2, 0.2, 0.2]),
      tracks: new Map<string, TimedNotes>([
        ["t1", new TimedNotes([
          new TimedNote(0.6, 1, NewNote("C", 4)),
        ])],
      ]),
      overlayNotes: new TimedNotes([]),
      recording: true,
    },
  }
}
