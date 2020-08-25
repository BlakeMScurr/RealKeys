import { validate, even, setWidths } from "./bars.js"

test("Even", () => {
    expect(even(["s", "", "e"])).toEqual(
        [
            {"length": 0.5, "type": "s"},
            {"length": 0.5, "type": ""},
            {"length": 0, "type": "e"}
        ]
    )
})

// widths of the whole bar area depending on the type of the final bar
let widthEndFinalBar = 360 + 25; 
let widthNormalFinalBar = 360 + 1

test("OneBar", ()=>{
    expect(setWidths(even(["s", "e"]), widthEndFinalBar)).toEqual(
        {
            bars: [
                {
                    "number": 1,
                    "type": "s",
                    "width": 360,
                },
                {
                    "number": "",
                    "type": "e",
                    "width": "remainder",
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
                    "width": 180,
                },
                {
                    "number": "",
                    "type": "e",
                    "width": "remainder",
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
                    "width": 90,
                },
                {
                    "number": "",
                    "type": "e",
                    "width": "remainder",
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
                    "width": 72,
                },
                {
                    "number": "",
                    "type": "",
                    "width": "remainder",
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
                    "width": 90,
                },
                {
                    "number": "",
                    "type": "e",
                    "width": "remainder",
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

test("ErrorLastBarLineNonZero", ()=>{
    expect(validate([
        { type: "s", length: 0.5 },
        { type: "e", length: 0.5 }
    ])).toEqual("length after final bar line must be zero, got: 0.5")
})