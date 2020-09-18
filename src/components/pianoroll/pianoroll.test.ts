import { Bars } from "./pianoroll"


test("TruncateBarsWidthError", ()=> {
    expect(()=>{new Bars([0.1, 0.1, 0.1, 0.1, 0.1]).truncate(1, 0)}).toThrow("Bars don't sum to 1: 0.5")
})

test("TruncateBarsRangeError", ()=> {
    expect(()=>{new Bars([0.2, 0.2, 0.2, 0.2, 0.2]).truncate(1, 0)}).toThrow("start must be before end")
})

test("TruncateBarsNoEffect", ()=> {
    expect(new Bars([0.2, 0.2, 0.2, 0.2, 0.2]).truncate(0, 1)).toEqual(new Bars([0.2, 0.2, 0.2, 0.2, 0.2]))
})

test("TruncateBarsStartSlice", ()=> {
    expect(new Bars([0.2, 0.2, 0.2, 0.2, 0.2]).truncate(0.5, 1)).toEqual(new Bars([0.2, 0.4, 0.4]))
})