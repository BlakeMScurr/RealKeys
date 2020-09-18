import { Bars } from "./pianoroll"

function fifthBars():Bars {
    return new Bars([0.2, 0.2, 0.2, 0.2, 0.2])
}

test("TruncateBarsWidthError", ()=> {
    expect(()=>{new Bars([0.1, 0.1, 0.1, 0.1, 0.1]).truncate(1, 0)}).toThrow("Bars don't sum to 1: 0.5")
})

test("TruncateBarsRangeError", ()=> {
    expect(()=>{fifthBars().truncate(1, 0)}).toThrow("start must be before end")
})

test("TruncateBarsNoEffect", ()=> {
    expect(fifthBars().truncate(0, 1)).toEqual(fifthBars())
})

test("TruncateBarsStartSlice", ()=> {
    expect(fifthBars().truncate(0.5, 1)).toEqual(new Bars([0.2, 0.4, 0.4]))
})

test("barLines", ()=>{
    expect(fifthBars().barLines()).toEqual([0, 0.2, 0.4, 0.6, 0.8, 1])
})