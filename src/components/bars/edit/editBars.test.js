import { createBars } from "./editBars.js"

test("Empty", ()=>{
    expect(createBars([], 2, 0)).toEqual([
        {type: "s", width: 1},
        {type: "e", width: 0}
    ])
})

test("SimpleTap1", ()=>{
    expect(createBars([1000, 1000], 2, 0)).toEqual([
        {type: "s", width: 0.5},
        {type: "", width: 0.5},
        {type: "e", width: 0}
    ])
})

test("SimpleTapOverhang", ()=>{
    expect(createBars([1000], 2, 0)).toEqual([
        {type: "s", width: 0.5},
        {type: "", width: 0.5},
        {type: "e", width: 0}
    ])
})

test("Multitap", ()=>{
    expect(createBars([1000, 1000, 1000, 1000], 4, 0)).toEqual([
        {type: "s", width: 0.25},
        {type: "", width: 0.25},
        {type: "", width: 0.25},
        {type: "", width: 0.25},
        {type: "e", width: 0}
    ])
})

test("MultitapOverhang", ()=>{
    expect(createBars([1000, 1000, 1000], 4, 0)).toEqual([
        {type: "s", width: 0.25},
        {type: "", width: 0.25},
        {type: "", width: 0.25},
        {type: "", width: 0.25},
        {type: "e", width: 0}
    ])
})

test("UnequalRhythm", ()=>{
    expect(createBars([1000, 2000, 1000], 4, 0)).toEqual(
        [
            {type: "s", width: 0.25},
            {type: "", width: 0.5},
            {type: "", width: 0.25},
            {type: "e", width: 0}
        ]
    )
})

test("UnequalRhythmOverhang", ()=>{
    expect(createBars([1000, 2000], 4, 0)).toEqual(
        [
            {type: "s", width: 0.25},
            {type: "", width: 0.5},
            {type: "", width: 0.25},
            {type: "e", width: 0}
        ]
    )
})

test("OffsetAnchor", ()=>{
    expect(createBars([], 2, 0.5)).toEqual([
        {type: "s", width: 0.5},
        {type: "", width: 0.5},
        {type: "e", width: 0}
    ])
})

test("OffsetAnchorOverhang", ()=>{
    expect(createBars([1000, 1000], 4, 0.25)).toEqual([
        {type: "s", width: 0.25},
        {type: "", width: 0.25},
        {type: "", width: 0.25},
        {type: "", width: 0.25},
        {type: "e", width: 0}
    ])
})

test("TooLongMatch", ()=>{
    expect(createBars([1000, 1000, 1000], 1, 0)).toEqual([
        {type: "s", width: 1},
        {type: "e", width: 0}
    ])
})

test("TooLongNonMatched", ()=>{
    expect(createBars([500, 1000, 23554, 3334, 1000], 1, 0)).toEqual([
        {type: "s", width: 0.5},
        {type: "", width: 0.5},
        {type: "e", width: 0}
    ])
})