import type { Note } from "../../../lib/music/theory/notes";
import { songDuration } from "../../../stores/stores";

export function zoomWidth() {
    let zoomLength = 4 * 1000 // length of the zoom window in seconds
    let duration;
    songDuration.subscribe((val)=>{
        duration = val
    })
    console.log(zoomLength, duration)
    return zoomLength / duration;
}

export function keyIndex(keys: Array<Note>, note: Note) {
    // assumes the keys are in order with no extra or missed - which should be a valid assumption!
    // TODO: remove keys objects everywhere - everything should be efficiently calculable with the bottom and top notes!
    return keys[0].intervalTo(note)
}