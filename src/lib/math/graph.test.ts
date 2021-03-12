import { graph } from "./graph"

test("init", () => {
    expect(() => {new graph([
        [191230, 15],
        [-1, 0],
    ])}).toThrow("edges can only have non negative integers, got edge -1 -> 0")

    expect(() => {new graph([
        [12, 12],
        [9, 0.123],
    ])}).toThrow("edges can only have non negative integers, got edge 9 -> 0.123")

    expect(() => {new graph([
        [2, 0],
    ])}).not.toThrow()

    expect(() => {new graph([
        [0, 0],
    ])}).not.toThrow()

    expect(() => {new graph([
        [12, 12],
    ])}).not.toThrow()
})

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
    expect(()=>{cycle3().dag()}).toThrow("this graph is not a dag, it has a cycle 0 -> 1 -> 2 -> 0")
    expect(()=>{cycle4().dag()}).toThrow("this graph is not a dag, it has a cycle 0 -> 1 -> 2 -> 3 -> 0")
})

// 0
// |\
// 1 2
function fork():graph {
    return new graph([
        [0,1],
        [0,2],
    ])
}

// 0
// |\
// 1 2
// |/
// 3
function diamond():graph {
    return new graph([
        [0,1],
        [0,2],
        [1,3],
        [2,3],
    ])
}

// 0 > 1
// ^   v
// < 2 <
function cycle3():graph {
    return new graph([
        [0,1],
        [1,2],
        [2,0],
    ])
}

// 0 > 1
// ^   v
// 3 < 2
function cycle4():graph {
    return new graph([
        [0,1],
        [1,2],
        [2,3],
        [3,0],
    ])
}