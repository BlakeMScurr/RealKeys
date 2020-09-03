// takes strings representing bar line types and returns evenly spaced barlines
export function even(barlines, width = 1) {
    return barlines.map((bar, i) => {
        return {
            type: bar,
            width: i < barlines.length - 1? width / (barlines.length - 1): 0,
            number: i+1,
        }
    })
}

function count(arr, val) {
    return arr.reduce((acc, curr) => {return curr == val ? acc + 1 : acc}, 0)
}

// Validate checks that the arrangement of barlines is logical
export function validate(bars) {
    let types = bars.map(bar => bar.type)
    let widths = bars.map(bar => bar.width) // lengths after each bar line

    const lastLength = widths[widths.length - 1]
    if (lastLength != 0) {
        return "length after final bar line must be zero, got: " + lastLength
    }
    
    // ensure the widths of the bars sum to 1
    let totalLength = widths.reduce((a,b) => a + b, 0)
    if (totalLength != 1) {
        return "total bar length too " + (totalLength < 1 ? "short" : "long") + ": " + totalLength
    }

    // Error on misplaced bar lines
    if (count(types, "s") !== 1) {
        return "expected single start repeat, got " + count(types, "s")
    }

    if (count(types, "e") !== 1) {
        return "expected single end repeat, got " + count(types, "e")
    }

    if (types.indexOf("s") > types.indexOf("e")) {
        return "start repeat is after end repeat"
    }

    return ""
}

// TODO: typescript
// TODO: rename, since this determines widths and autocorrects
// TODO: refactor to be far less lenient and instead show an issue/apology/communication screen - this is necessary for fast feedback and development improvement
export function setWidths(bars, width, start=0, end=1) {
    let types = bars.map(bar => bar.type)
    let widths = bars.map(bar => bar.width) // lengths after each bar line

    let validationError = validate(bars)
    if (validationError != "") {
        return {
            bars: [{type: "s", width: width - 25, number: ""}, {type: "e", width: 25, number: ""}],
            error: validationError,
        }
    }

    let widenedBars = types.map((type, i) => {
        let barWidth = widths[i] * width

        return {
            type: type,
            width: barWidth, // TODO: s/width/length or at least make it consistent somehow
            number: i < types.length -1 ? i + 1: '', // TODO: s/number/label
        }
    })

    // get width of last barline from the previous bar
    widenedBars = giveFinalBarSpace(widenedBars)
    let zoomedbars = zoom(widenedBars, start * width, end * width, width)
    let declutteredBars = reduceClutter(zoomedbars)
    return {
        bars: declutteredBars,
        error: "",
    }
}

// The final bar line has a time lenght of zero, but it still has to occupy some space.
// Get that space from the previous bars.
export function giveFinalBarSpace(bars) {
    let types = bars.map(bar => bar.type)
    let ebw = endbarwidth(types[types.length-1])

    while (bars[bars.length-1].width < ebw) {
        if (bars[bars.length-2].width < 0) {
            throw new Error("negative length bar line")
        }

        // allocate space from second last bars
        let spaceneeded = ebw - bars[bars.length-1].width
        if (bars[bars.length-2].width >= spaceneeded) {
            bars[bars.length-2].width = bars[bars.length-2].width - spaceneeded
            bars[bars.length-1].width = ebw
        } else {
            bars[bars.length-1].width += bars[bars.length-2].width
            bars[bars.length-2].width = 0
        }

        // remove second last bar if it lost all its space
        if (bars[bars.length-2].width == 0) {
            bars.splice(bars.length-2, 1)
        }
    }

    return bars
}

// reduce clutter takes a set of validated bars and removes unnecessary bar numbers and bars that
// will look too cluttering on the given width
const minimumBarWidth = 50;
export function reduceClutter(bars, width) {
    let newbars = bars.slice()

    for (let i = 0; i < newbars.length - 1; i++) {
        if (newbars[i].type != "x" && newbars[i].width < minimumBarWidth) { // x signifies bars to be deleted, TODO: delete them elegantly in the first pass
            outerloop:
            for (let j = i+1; j < newbars.length - 1; j++) {
                newbars[i].width += newbars[j].width
                newbars[j].type = "x"
                if (newbars[i].width >= minimumBarWidth) {
                    break outerloop
                }
            }
        }
    }

    return newbars.filter((bar)=>{
        return bar.type != "x"
    })
}

function strip(number) { // fixing some floating point arithmetic problems
    const bigNum = 1000000
    return Math.round(number*bigNum)/bigNum
}

export function zoom(bars, start, end, width) {
    if (start >= end) {
        throw new Error("start after end")
    }

    let newbars = bars.slice()
    let startWidth = 0;
    for (let i = 0; i < newbars.length; i++) {
        let nbil = newbars[i].width
        // mark for deletion newbars that:
        if (startWidth + newbars[i].width <= start || // end before the start of the zoom area
            startWidth + endbarwidth(newbars[i].type) > end) { // or start after the end of the zoom area
            newbars[i].delete = true
        }

        // truncate newbars that
        // - start before the start of the zoom area and end after the start of the zoom area
        if (startWidth <= start && startWidth + newbars[i].width >= start) {
            newbars[i].width = strip((startWidth + newbars[i].width) - start)
        }
        // - start before the end of the zoom area and end after the end of the zoom area
        if (startWidth <= end && startWidth + newbars[i].width >= end) {
            newbars[i].width = strip(end - startWidth)
        }

        // increment accumulator
        startWidth += nbil
    }

    // delete marked bars
    let truncatedBars = newbars.filter((bar)=>{
        return !bar.delete
    })


    let scaleFactor = width/(end - start)
    
    let zb = truncatedBars.map((bar, i)=>{ // make zoomed bars
        bar.width = scaleFactor * bar.width
        return bar
    })
    
    zb[zb.length-1].width += 2 // TODO: why does the prod version overflow if we don't do this?

    // ensure that the last bar has the proper width
    return zb
}

// find the position in pixels at which to render the seek icon, given a percentage position, a width of the whole barlines, and the start and ends of the
// zoom in percentages.
const halfWidthOfSeeker = 10;
export function getSeekPixels(percentage, width, zoomStart, zoomEnd) {
    let posGivenZoom = (percentage - zoomStart)/(zoomEnd-zoomStart) // find the proper fractional position given the zoom
    return posGivenZoom * width - halfWidthOfSeeker  // account for the real width
}

// inverse of getSeekPixels
export function getSeekPercentage(position, width, zoomStart, zoomEnd) {
    // from getSeekPixels
    // (percentage - zoomStart)/(zoomEnd-zoomStart) * width - halfWidthOfSeeker) == position
    // thus
    // (position + halfWidthOfSeeker)*(zoomEnd-zoomStart)/width + zoomStart == percentage
    return (position + halfWidthOfSeeker)*(zoomEnd-zoomStart)/width + zoomStart
}

function endbarwidth(bartype) {
    switch(bartype) {
        case "s": // TODO: throw error here too - the start bar shouldn't be the last bar
        case "e":
            return 25;
        case "":
            return 1;
        default:
            throw new Error("invalid end bar type " + bartype)
    }
}