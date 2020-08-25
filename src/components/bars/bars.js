// takes strings representing bar line types and returns evenly spaced barlines
export function even(barlines) {
    return barlines.map((bar, i) => {
        return {
            type: bar,
            length: i < barlines.length - 1? 1 / (barlines.length - 1): 0,
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
    let widths = bars.map(bar => bar.length) // lengths after each bar line

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
export function setWidths(bars, width) {
    let types = bars.map(bar => bar.type)
    let widths = bars.map(bar => bar.length) // lengths after each bar line

    let validationError = validate(bars)
    if (validationError != "") {
        return {
            bars: [{type: "s", width: width - 25, number: ""}, {type: "e", width: 25, number: ""}],
            error: validationError,
        }
    }

    // remove the width of the last barline
    switch (types[types.length-1]) {
        case "e":
            width -= 25 // end bars have width 25
            widths[widths.length-1] = 25 / width
            break;
        case "":
            width -= 1 // regular bars have width 1
            widths[widths.length-1] = 1 / width
            break;
    }

    return {
        bars: types.map((type, i) => {
            let barWidth = widths[i] * width
            // TODO: for some reason, on the real page (not storybook) if we set the width to an invalid value rather than 25px
            // it will remain 25px (due to the leftover space for it) and it will suddenly stop spilling over to the next line, despite
            // not having changed width
            if (i == widths.length - 1) { barWidth = "remainder"} 

            return {
                type: type,
                width: barWidth,
                number: i < types.length -1 ? i + 1: '', // TODO: s/number/label
            }
        }),
        error: "",
    }
}

// reduce clutter takes a set of validated bars and removes unnecessary bar numbers and bars that
// will look too cluttering on the given width
const minimumBarWidth = 50;
export function reduceClutter(bars, width) {
    let newbars = bars.slice()

    for (let i = 0; i < newbars.length - 1; i++) {
        if (newbars[i].type != "x" && newbars[i].width < minimumBarWidth) { // x signifies bars to be deleted, TODO: delete them elegantly in the first pass
            outerloop:
            for (let j = i+1; j < newbars.length; j++) {
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