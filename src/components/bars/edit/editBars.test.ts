import { createUnevenBars, createEvenBars } from "./editBars"

test("Empty", ()=>{
    expect(createUnevenBars([], 2, 0)).toEqual([
        {type: "s", width: 1},
        {type: "e", width: 0}
    ])
})

test("SimpleTap1", ()=>{
    expect(createUnevenBars([1000, 1000], 2, 0)).toEqual([
        {type: "s", width: 0.5},
        {type: "", width: 0.5},
        {type: "e", width: 0}
    ])
})

test("SimpleTapOverhang", ()=>{
    expect(createUnevenBars([1000], 2, 0)).toEqual([
        {type: "s", width: 0.5},
        {type: "", width: 0.5},
        {type: "e", width: 0}
    ])
})

test("Multitap", ()=>{
    expect(createUnevenBars([1000, 1000, 1000, 1000], 4, 0)).toEqual([
        {type: "s", width: 0.25},
        {type: "", width: 0.25},
        {type: "", width: 0.25},
        {type: "", width: 0.25},
        {type: "e", width: 0}
    ])
})

test("MultitapOverhang", ()=>{
    expect(createUnevenBars([1000, 1000, 1000], 4, 0)).toEqual([
        {type: "s", width: 0.25},
        {type: "", width: 0.25},
        {type: "", width: 0.25},
        {type: "", width: 0.25},
        {type: "e", width: 0}
    ])
})

test("UnequalRhythm", ()=>{
    expect(createUnevenBars([1000, 2000, 1000], 4, 0)).toEqual(
        [
            {type: "s", width: 0.25},
            {type: "", width: 0.5},
            {type: "", width: 0.25},
            {type: "e", width: 0}
        ]
    )
})

test("UnequalRhythmOverhang", ()=>{
    expect(createUnevenBars([1000, 2000], 4, 0)).toEqual(
        [
            {type: "s", width: 0.25},
            {type: "", width: 0.5},
            {type: "", width: 0.25},
            {type: "e", width: 0}
        ]
    )
})

test("OffsetAnchor", ()=>{
    expect(createUnevenBars([], 2, 0.5)).toEqual([
        {type: "s", width: 0.5},
        {type: "", width: 0.5},
        {type: "e", width: 0}
    ])
})

test("OffsetAnchorOverhang", ()=>{
    expect(createUnevenBars([1000, 1000], 4, 0.25)).toEqual([
        {type: "s", width: 0.25},
        {type: "", width: 0.25},
        {type: "", width: 0.25},
        {type: "", width: 0.25},
        {type: "e", width: 0}
    ])
})

test("TooLongMatch", ()=>{
    expect(createUnevenBars([1000, 1000, 1000], 1, 0)).toEqual([
        {type: "s", width: 1},
        {type: "e", width: 0}
    ])
})

test("TooLongNonMatched", ()=>{
    expect(createUnevenBars([500, 1000, 23554, 3334, 1000], 1, 0)).toEqual([
        {type: "s", width: 0.5},
        {type: "", width: 0.5},
        {type: "e", width: 0}
    ])
})

test("EvenBasic", ()=>{
    expect(createEvenBars(0, 60, 5)).toEqual([
        {type: "s", width: 0.2},
        {type: "", width: 0.2},
        {type: "", width: 0.2},
        {type: "", width: 0.2},
        {type: "", width: 0.2},
        {type: "e", width: 0},
    ])
})

test("EvenAnchor", ()=>{
    expect(createEvenBars(0.4, 60, 5)).toEqual([
        {type: "s", width: 0.2},
        {type: "", width: 0.2},
        {type: "", width: 0.2},
        {type: "", width: 0.2},
        {type: "", width: 0.2},
        {type: "e", width: 0},
    ])
})

test("EvenTruncatedStartEnd", ()=>{
    expect(createEvenBars(0.1, 60, 5)).toEqual([
        {type: "s", width: 0.1},
        {type: "", width: 0.2},
        {type: "", width: 0.2},
        {type: "", width: 0.2},
        {type: "", width: 0.2},
        {type: "", width: 0.1},
        {type: "e", width: 0},
    ])
})