import { calculateBeats, errorValue, impliedBeat, generateBeats } from "./beatcalculation.js"

test("Basic", ()=>{
    let pulses = [0,1,2,3,4,5,6]
    let bpm = 60 // beat length 1
    let result = [0,1,2,3,4,5,6]
    expect(calculateBeats(pulses, bpm)).toEqual(result)
})

test("HalfSpeed", ()=>{
    let pulses = [0,1,2,3,4,5,6]
    let bpm = 30 // beat length 2
    let result = [0,2,4,6]
    expect(calculateBeats(pulses, bpm)).toEqual(result)
})

test("DoubleSpeed", ()=>{
    let pulses = [0,1,2,3,4,5,6]
    let bpm = 120 // beat length 0.5
    let result = [0,0.5,1,1.5,2,2.5,3,3.5,4,4.5,5,5.5,6]
    expect(calculateBeats(pulses, bpm)).toEqual(result)
})

test("Outlier", ()=>{
    let pulses = [0,1,1.5,2,3,4,5,6]
    let bpm = 60 // beat length 0.5
    let result = [0,1,2,3,4,5,6]
    expect(calculateBeats(pulses, bpm)).toEqual(result)
})

test("SmallOutlier", ()=>{
    let pulses = [0,1,1.0001,2,3,4,5,6]
    let bpm = 60 // beat length 0.5
    let result = [0,1,2,3,4,5,6]
    expect(calculateBeats(pulses, bpm)).toEqual(result)
})

test("TwoPossibilities", ()=>{
    let pulses = [10,13,20,23,30,33,40,50]
    let bpm = 6 // beat length 10
    let result = [0,10,20,30,40,50]
    expect(calculateBeats(pulses, bpm)).toEqual(result)
})

// Auxillary functions
test("ErrorValue", ()=>{
    expect(errorValue(0, 1, 1)).toBe(0) // basic
    expect(errorValue(1, 0, 1)).toBe(0) // higher/lower flipped
    expect(errorValue(0, 10, 1)).toBe(0) // distant
    expect(errorValue(0, 1.1, 0.1)).toBe(0) // upper difference
    expect(errorValue(0, 0.9, 0.1)).toBe(0) // lower difference
})

test("ImpliedBeat", ()=>{
    expect(impliedBeat(0,1,1)).toEqual(0)
    expect(impliedBeat(1,2,1)).toEqual(1)
    expect(impliedBeat(1,2.5,1)).toEqual(1.5)
    expect(impliedBeat(1,2.1,1)).toEqual(1.1)
    expect(impliedBeat(1,2.9,1)).toEqual(1.9)
})

test("GenerateBeats", ()=>{
    expect(generateBeats(0,5,1)).toEqual([0,1,2,3,4,5])
    expect(generateBeats(0,5.9,1)).toEqual([0,1,2,3,4,5])
    expect(generateBeats(0,4.9,1)).toEqual([0,1,2,3,4])
    expect(generateBeats(0,5,2)).toEqual([0,2,4])
    expect(generateBeats(1,5,2)).toEqual([1,3,5])
    expect(generateBeats(0.5,5,2)).toEqual([0.5,2.5,4.5])
    expect(generateBeats(4,6,1)).toEqual([0,1,2,3,4,5,6])
    expect(()=>{generateBeats(0,1,-1)}).toThrow("invalid beat length -1")
})