import { graph } from "./graph"

test("CycleFomNode/Acyclic", () => {
    expect(fork().cycleFrom(0, [])).toEqual([])
    expect(fork().cycleFrom(1, [])).toEqual([])
    expect(fork().cycleFrom(2, [])).toEqual([])
    
    expect(diamond().cycleFrom(0, [])).toEqual([])
    expect(diamond().cycleFrom(1, [])).toEqual([])
    expect(diamond().cycleFrom(2, [])).toEqual([])
    expect(diamond().cycleFrom(3, [])).toEqual([])
})

test("CycleFomNode/Cyclic", () => {
    // Cyclics
    expect(cycle3().cycleFrom(0, [])).toEqual([0, 1, 2, 0])
    expect(cycle3().cycleFrom(1, [])).toEqual([1, 2, 0, 1])
    expect(cycle3().cycleFrom(2, [])).toEqual([2, 0, 1, 2])

    expect(cycle4().cycleFrom(0, [])).toEqual([0, 1, 2, 3, 0])
    expect(cycle4().cycleFrom(1, [])).toEqual([1, 2, 3, 0, 1])
    expect(cycle4().cycleFrom(2, [])).toEqual([2, 3, 0, 1, 2])
    expect(cycle4().cycleFrom(3, [])).toEqual([3, 0, 1, 2, 3])
})

test("dag", () => {
    expect(()=>{fork().dag()}).not.toThrow()
    expect(()=>{diamond().dag()}).not.toThrow()
    expect(()=>{cycle3().dag()}).toThrow()
    expect(()=>{cycle4().dag()}).toThrow()
})

// 0
// |\
// 1 2
function fork():graph {
    return new graph([
        [false, true, true],
        [false, false, false],
        [false, false, false],
    ])
}

// 0
// |\
// 1 2
// |/
// 3
function diamond():graph {
    return new graph([
        [false, true, true, false],
        [false, false, false, true],
        [false, false, false, true],
        [false, false, false, false],
    ])
}

// 0 > 1
// ^   v
// < 2 <
function cycle3():graph {
    return new graph([
        [false, true, false],
        [false, false, true],
        [true, false, false],
    ])
}

// 0 > 1
// ^   v
// 3 < 2
function cycle4():graph {
    return new graph([
        [false, true, false, false],
        [false, false, true, false],
        [false, false, false, true],
        [true, false, false, false],
    ])
}