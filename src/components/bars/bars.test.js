import { validate, even, setWidths, reduceClutter, zoom, getSeekPixels, getSeekPercentage, giveFinalBarSpace } from "./bars.js"

test("Even", () => {
    expect(even(["s", "", "e"])).toEqual(
        [
            {"width": 0.5, "type": "s", number: 1},
            {"width": 0.5, "type": "", number: 2},
            {"width": 0, "type": "e", number: 3}
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
                    "number": 2,
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
                    "number": 3,
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
                    "number": 5,
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
                    "number": 6,
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
        { type: "s", width: 0.75 },
        { type: "", width: 0.25 },
        { type: "e", width: 0 }
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
                    "number": 3,
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
        { type: "s", width: 0.5 },
        { type: "", width: 0.25 },
        { type: "e", width: 0 }
    ])).toEqual("total bar length too short: 0.75")
})
    
test("ErrorLengthSumTooHigh", ()=>{
    expect(validate([
        { type: "s", width: 0.75 },
        { type: "", width: 0.75 },
        { type: "e", width: 0 }
    ])).toEqual("total bar length too long: 1.5")
})

test("ErrorLastBarLineNonZero", () => {
    expect(validate([
        { type: "s", width: 0.5 },
        { type: "e", width: 0.5 }
    ])).toEqual("length after final bar line must be zero, got: 0.5")
})

// cluttering tests
test("Cluttering", () => {
    let eightBars = even(["s", "", "", "", "", "", "", "", "e"], 360);

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
        let b = even(["s", "", "", "", "e"], 100)
        return b
    }

    // expect(zoom(fourBars(), 0, 125, 125)).toEqual(fourBars())
    // expect(()=>{zoom(fourBars(), 1, 0, 1)}).toThrow("start after end")
    // expect(zoom(fourBars(), 50, 100, 125)).toEqual(
    //     [
    //         {"number": 3, "type": "", "width": 62.5},
    //         {"number": 4, "type": "", "width": 62.5},
    //     ],
    // )
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

    expect(zoom([
        {
          "type": "s",
          "width": 112.3333333333334,
          "number": 1
        },
        {
          "type": "",
          "width": 112.33333333333333,
          "number": 2
        },
        {
          "type": "",
          "width": 112.33333333333333,
          "number": 3
        },
        {
          "type": "",
          "width": 112.33333333333333,
          "number": 4
        },
        {
          "type": "",
          "width": 112.33333333333333,
          "number": 5
        },
        {
          "type": "",
          "width": 87.33333333333333,
          "number": 6
        },
        {
          "type": "e",
          "width": 25,
          "number": 7
        }
      ], 0, 674, 674)).toEqual([
        {
          "type": "s",
          "width": 112.333333,
          "number": 1
        },
        {
          "type": "",
          "width": 112.33333333333333,
          "number": 2
        },
        {
          "type": "",
          "width": 112.33333333333333,
          "number": 3
        },
        {
          "type": "",
          "width": 112.33333333333333,
          "number": 4
        },
        {
          "type": "",
          "width": 112.33333333333333,
          "number": 5
        },
        {
            "type": "",
            "width": 87.33333333333333,
            "number": 6
        },
        {
        "type": "e",
        "width": 25,
        "number": 7
        }
      ])
})

test("Seek", ()=>{
    expect(getSeekPixels(0.5, 100, 0, 1)).toBe(40)
    expect(getSeekPixels(0.25, 200, 0, 1)).toBe(40)
    expect(getSeekPixels(0.5, 100, 0.5, 1)).toBe(-10) // test zoom

    // Test inversion
    expect(getSeekPercentage(getSeekPixels(0.5, 100, 0, 1), 100, 0, 1)).toBe(0.5)
    expect(getSeekPercentage(getSeekPixels(0.25, 200, 0, 1), 200, 0, 1)).toBe(0.25)
    expect(getSeekPercentage(getSeekPixels(0.5, 100, 0.5, 1), 100, 0.5, 1)).toBe(0.5)

})

test("GiveFinalBarSpace", ()=>{
    expect(giveFinalBarSpace([
        {
            type: "s",
            width: 100,
            number: 0,
        },
        {
            type: "e",
            width: 0,
            number: 1,
        },
    ])).toEqual([
        {
            type: "s",
            width: 75,
            number: 0,
        },
        {
            type: "e",
            width: 25,
            number: 1,
        },
    ])

    expect(giveFinalBarSpace([
        {
            type: "s",
            width: 20,
            number: 0,
        },
        {
            type: "",
            width: 20,
            number: 1,
        },
        {
            type: "",
            width: 20,
            number: 2,
        },
        {
            type: "",
            width: 20,
            number: 3,
        },
        {
            type: "",
            width: 20,
            number: 4,
        },
        {
            type: "e",
            width: 0,
            number: 5,
        },
    ])).toEqual([
        {
            type: "s",
            width: 20,
            number: 0,
        },
        {
            type: "",
            width: 20,
            number: 1,
        },
        {
            type: "",
            width: 20,
            number: 2,
        },
        {
            type: "",
            width: 15,
            number: 3,
        },
        {
            type: "e",
            width: 25,
            number: 5,
        },
    ])
})