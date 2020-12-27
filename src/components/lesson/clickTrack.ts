import { GameMaster } from "../../stores/stores"
import { highClick, lowClick, newClicker } from "../../lib/track/instrument"
import { TimedNote, TimedNotes } from "../../lib/music/timed/timed";

export function makeClicks(bars: Array<number>, timesignatures, gm: GameMaster) {
    let barLength = 4
    if (timesignatures != undefined && timesignatures[0] != undefined && timesignatures[0].timeSignature != undefined && timesignatures[0].timeSignature[1] != undefined) {
        barLength = timesignatures[0].timeSignature[1]
    }

    let currPos = 0;
    let i = 0
    // TODO: use for loop
    let clicks = bars.map((bar) => {
        let oldPos = currPos
        currPos += bar
        let note = i % barLength == 0 ? highClick : lowClick
        i++
        return new TimedNote(oldPos, oldPos + 0.1, note)
    })

    let clicker = newClicker("Click Track")
    gm.tracks.newPlaybackTrack("clickTrack", new TimedNotes(clicks), clicker, gm)
}