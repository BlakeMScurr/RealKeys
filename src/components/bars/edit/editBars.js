import { strip } from "../../../utils/util.js"

// createBars gives a set of bar lengths given a number of taps starting from a position
export function createUnevenBars(tapTimes, songLengthInSeconds, anchorPosition) {
    // calculate bar widths as proportions of the song
    let bars = tapTimes.map((time)=>{
        return {
            type: "",
            width: (time/1000)/songLengthInSeconds
        }
    })
    
    // fill out starting bars
    let positionTime = anchorPosition * songLengthInSeconds
    if (positionTime != 0) {
        bars.unshift({type: "s", width: positionTime/songLengthInSeconds})
    } else {
        if (bars.length == 0) {
            bars.push({type:"s", width: 1})
        } else {
            bars[0].type = "s"
        }
    }

    // fill out final bars
    let totalWidth = 0;
    for (let i = 0; i < bars.length; i++) {
        const bar = bars[i];
        totalWidth += bar.width
        if (totalWidth > 1) {
            totalWidth -= bar.width
            bars = bars.slice(0, i)
        }
    }

    if (totalWidth < 1) {
        bars.push({type: "", width:1-totalWidth})
    }

    bars.push({type: "e", width: 0})

    return bars
}

export function createEvenBars(anchor, bpm, songLength) {
    let beatLength = (60/bpm)/songLength

    while (anchor-beatLength > 0) {
        anchor -= beatLength
    }

    let totalWidth = 0
    let beats = []
    if (anchor > 0) {
        beats.push(anchor)
        totalWidth += anchor
    }

    while (totalWidth + beatLength <= 1) {
        beats.push(beatLength)
        totalWidth += beatLength
    }

    if (totalWidth < 1) {
        beats.push(1 - totalWidth)
        totalWidth += 1 - totalWidth
    }

    beats.push(0)
    let barlines = beats.map((width)=>{
        return {
            type: "",
            width: strip(width),
        }
    })

    barlines[0].type = "s"
    barlines[barlines.length-1].type = "e"

    return barlines
}