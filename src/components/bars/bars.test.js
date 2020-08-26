import { validate, even, setWidths, reduceClutter, zoom, getSeekPixels } from "./bars.js"

test("Even", () => {
    expect(even(["s", "", "e"])).toEqual(
        [
            {"length": 0.5, "type": "s", number: 1},
            {"length": 0.5, "type": "", number: 2},
            {"length": 0, "type": "e", number: 3}
        ]
    )
})

// widths of the whole bar area depending on the type of the final bar
let widthEndFinalBar = 360; 
let widthNormalFinalBar = 360

test("OneBar", ()=>{
    expect(setWidths(even(["s", "e"]), widthEndFinalBar)).toEqual(
        {
            bars: [
                {
                    "number": 1,
                    "type": "s",
                    "width": 335,
                },
                {
                    "number": "",
                    "type": "e",
                    "width": 25,
                },
            ],
            error: "",
        }
    )
})

test("TwoBars", ()=>{
    expect(setWidths(even(["s", "", "e"]), widthEndFinalBar)).toEqual(
        {
            bars:[
                {
                    "number": 1,
                    "type": "s",
                    "width": 180,
                },
                {
                    "number": 2,
                    "type": "",
                    "width": 155,
                },
                {
                    "number": "",
                    "type": "e",
                    "width": 25,
                },
            ],
            error: "",
        }
    )
})

test("FourBars", ()=>{
    expect(setWidths(even(["s", "", "", "", "e"]), widthEndFinalBar)).toEqual(
        {
            bars: [
                {
                    "number": 1,
                    "type": "s",
                    "width": 90,
                },
                {
                    "number": 2,
                    "type": "",
                    "width": 90,
                },
                {
                    "number": 3,
                    "type": "",
                    "width": 90,
                },
                {
                    "number": 4,
                    "type": "",
                    "width": 65,
                },
                {
                    "number": "",
                    "type": "e",
                    "width": 25,
                },
            ],
            error: "",
        }
    )
})

test("RepeatInTheMiddle", ()=>{
    expect(setWidths(even(["", "s", "", "e", "", ""]), widthNormalFinalBar)).toEqual(
        {
            bars: [
                {
                    "number": 1,
                    "type": "",
                    "width": 72,
                },
                {
                    "number": 2,
                    "type": "s",
                    "width": 72,
                },
                {
                    "number": 3,
                    "type": "",
                    "width": 72,
                },
                {
                    "number": 4,
                    "type": "e",
                    "width": 72,
                },
                {
                    "number": 5,
                    "type": "",
                    "width": 71,
                },
                {
                    "number": "",
                    "type": "",
                    "width": 1,
                },
            ],
            error: "",
        }
    )
})

test("UnevenWidths", ()=>{
    expect(setWidths([
        { type: "s", length: 0.75 },
        { type: "", length: 0.25 },
        { type: "e", length: 0 }
    ], widthEndFinalBar)).toEqual(
        {
            bars: [
                {
                    "number": 1,
                    "type": "s",
                    "width": 270,
                },
                {
                    "number": 2,
                    "type": "",
                    "width": 65,
                },
                {
                    "number": "",
                    "type": "e",
                    "width": 25,
                }
            ],
            error: "",
        }
    )
})

// Erroring tests
test("ErrorMissingStart", ()=>{
    expect(validate(even(["", "e"]), widthEndFinalBar)).toEqual("expected single start repeat, got 0")
})

test("ErrorMissingEnd", ()=>{
    expect(validate(even(["s", ""]), widthNormalFinalBar)).toEqual("expected single end repeat, got 0")
})

test("ErrorMissingStartAndEnd", ()=>{
    expect(validate(even(["", ""]), widthNormalFinalBar)).toEqual("expected single start repeat, got 0")
})

test("ErrorMultipleStarts", ()=>{
    expect(validate(even(["s", "s", "", "e"]), widthEndFinalBar)).toEqual("expected single start repeat, got 2")
})

test("ErrorMultipleEnds", ()=>{
    expect(validate(even(["s", "", "e", "e"]), widthEndFinalBar)).toEqual("expected single end repeat, got 2")
})

test("ErrorMultipleStartsAndEnds", ()=>{
    expect(validate(even(["s", "s", "e", "e"]), widthEndFinalBar)).toEqual("expected single start repeat, got 2")
})

test("ErrorStartBeforeEnd", ()=>{
    expect(validate(even(["", "e", "s", ""]), widthNormalFinalBar)).toEqual("start repeat is after end repeat")
})

test("ErrorStartBeforeEndMultiple", ()=>{
    expect(validate(even(["s", "e", "s", "e"]), widthEndFinalBar)).toEqual("expected single start repeat, got 2")
})

test("ErrorLengthSumTooLow", ()=>{
    expect(validate([
        { type: "s", length: 0.5 },
        { type: "", length: 0.25 },
        { type: "e", length: 0 }
    ])).toEqual("total bar length too short: 0.75")
})
    
test("ErrorLengthSumTooHigh", ()=>{
    expect(validate([
        { type: "s", length: 0.75 },
        { type: "", length: 0.75 },
        { type: "e", length: 0 }
    ])).toEqual("total bar length too long: 1.5")
})

test("ErrorLastBarLineNonZero", () => {
    expect(validate([
        { type: "s", length: 0.5 },
        { type: "e", length: 0.5 }
    ])).toEqual("length after final bar line must be zero, got: 0.5")
})

// cluttering tests
test("Cluttering", () => {
    let eightBars = even(["s", "", "", "", "", "", "", "", "e"]);
    for (let i = 0; i < eightBars.length; i++) { // this little dumb thing just changes length to width because the bar type before and after applying width transformations are inconsistent. TODO: stop doing that
        eightBars[i].width = eightBars[i].length * 360;
        delete eightBars[i].length;
    }

    expect(reduceClutter(eightBars, 360)).toEqual([
        {
            "number": 1,
            "type": "s",
            "width": 90,
        },
        {
            "number": 3,
            "type": "",
            "width": 90,
        },
        {
            "number": 5,
            "type": "",
            "width": 90,
        },
        {
            "number": 7,
            "type": "",
            "width": 90,
        },
        {
            "number": 9,
            "type": "e",
            "width": 0,
        },
    ])
})

test("Zoom", () => { // these tests have more or less become garbage. TODO: make 'em logical again
    let fourBars = () => { 
        let b = even(["s", "", "", "", "e"])
        for (let i = 0; i < b.length; i++) {
            b[i].width = b[i].length * 100;
            delete b[i].length;
        }
        return b
    }

    expect(zoom(fourBars(), 0, 125, 125)).toEqual(fourBars())
    expect(()=>{zoom(fourBars(), 1, 0, 1)}).toThrow("start after end")
    expect(zoom(fourBars(), 50, 100, 125)).toEqual(
        [
            {"number": 3, "type": "", "width": 62.5},
            {"number": 4, "type": "", "width": 62.5},
        ],
    )
    // expect(zoom(fourBars(), 0.49, 1, 1)).toEqual(
    //     [
    //         {"number": 2, "type": "", "width": 0.0196078431372549},
    //         {"number": 3, "type": "", "width": 0.49019607843137253},
    //         {"number": 4, "type": "", "width": 0.49019607843137253},
    //         {"number": 5, "type": "e", "width": 0},
    //     ],
    // )
    // expect(zoom(fourBars(), 0.5, 0.75, 1)).toEqual(
    //     [
    //         {"number": 3, "type": "", "width": 1},
    //         {"number": 4, "type": "", "width": 0},
    //     ],
    // )
    // expect(zoom(fourBars(), 0.5, 0.76, 1)).toEqual(
    //     [
    //         {"number": 3, "type": "", "width": 0.9615384615384615},
    //         {"number": 4, "type": "", "width": 0.03846153846153846},
    //     ],
    // )
})

test("SeekPixels", ()=>{
    expect(getSeekPixels(0.5, 100, 0, 1)).toBe(40)
    expect(getSeekPixels(0.25, 200, 0, 1)).toBe(40)
    expect(getSeekPixels(0.5, 100, 0.5, 1)).toBe(-10) // test zoom
})