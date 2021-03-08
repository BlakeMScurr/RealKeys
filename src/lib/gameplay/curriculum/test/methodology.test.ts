import { modeFactory, modeName } from "../../mode/mode"
import { PieceBreakdown, SequentialCurriculum } from "../methodology/sequential"
import { tutorial } from "../methodology/tutorial"
import { hand, task } from "../task"

test("PieceBreakdown", ()=>{
    expect(()=>{new PieceBreakdown("mock", [[1,2]])}).not.toThrow()
    expect(()=>{new PieceBreakdown("mock", [[1,2,4], [1,4]])}).not.toThrow()

    expect(()=>{new PieceBreakdown("mock", [[1]])}).toThrow("Breakdown layer has too few boundaries (1) to delineate a section")
    expect(()=>{new PieceBreakdown("mock", [[]])}).toThrow("Breakdown layer has too few boundaries (0) to delineate a section")
    expect(()=>{new PieceBreakdown("mock", [[1,2,4,6], [1,3,6]])}).toThrow("Boundary at bar 3 does not exist in previous layer")
    expect(()=>{new PieceBreakdown("mock", [[1,4], [1,4]])}).toThrow("Section (1,4) is not updated between two layers")
    expect(()=>{new PieceBreakdown("mock", [[1,2,4], [1,2]])}).toThrow("Breakdown layers have different outer boundaries: (1,4) vs (1,2)")
    expect(()=>{new PieceBreakdown("mock", [[1,6], [1,4]])}).toThrow("Breakdown layers have different outer boundaries: (1,6) vs (1,4)")
    expect(()=>{new PieceBreakdown("mock", [[1,3], [1,4]])}).toThrow("Breakdown layers have different outer boundaries: (1,3) vs (1,4)")
})

test("Sequential Curriculum.next", () => {
    let c = new SequentialCurriculum([new PieceBreakdown("mock", [[1,2]])]).curriculum()

    let t1 = new task(1,2, hand.Right, "mock", modeFactory(modeName.wait))
    let t2 = new task(1,2, hand.Right, "mock", modeFactory(modeName.atSpeed, 75))
    let t3 = new task(1,2, hand.Right, "mock", modeFactory(modeName.atSpeed, 100))
    let t4 = new task(1,2, hand.Left, "mock", modeFactory(modeName.wait))
    let t5 = new task(1,2, hand.Left, "mock", modeFactory(modeName.atSpeed, 75))
    let t6 = new task(1,2, hand.Left, "mock", modeFactory(modeName.atSpeed, 100))
    let t7 = new task(1,2, hand.Both, "mock", modeFactory(modeName.wait))
    let t8 = new task(1,2, hand.Both, "mock", modeFactory(modeName.atSpeed, 75))
    let t9 = new task(1,2, hand.Both, "mock", modeFactory(modeName.atSpeed, 100))

    expect(c.next()).toEqual(t1)
    c.recordScore(t1, 100)
    expect(c.next()).toEqual(t2)
    c.recordScore(t2, 100)
    expect(c.next()).toEqual(t3)
    c.recordScore(t3, 100)
    expect(c.next()).toEqual(t4)
    c.recordScore(t4, 100)
    expect(c.next()).toEqual(t5)
    c.recordScore(t5, 100)
    expect(c.next()).toEqual(t6)
    c.recordScore(t6, 100)
    expect(c.next()).toEqual(t7)
    c.recordScore(t7, 100)
    expect(c.next()).toEqual(t8)
    c.recordScore(t8, 100)
    expect(c.next()).toEqual(t9)
    c.recordScore(t9, 100)
})

test('Tutorial.curriculum fails', () => {
    let c = new tutorial("mock", [[1, modeName.wait], [0, modeName.wait]])
    expect(()=>{c.curriculum()}).toThrow("end bar 0 before start bar 1")
    
    c = new tutorial("mock", [[0, modeName.wait], [0, modeName.wait]])
    expect(()=>{c.curriculum()}).toThrow("end bar 0 before start bar 0")

    c = new tutorial("mock", [[0, modeName.pause], [1, modeName.wait]])
    expect(()=>{c.curriculum()}).not.toThrow()

    c = new tutorial("mock", [[1, modeName.play], [1, modeName.wait]])
    expect(()=>{c.curriculum()}).toThrow("end bar 1 before start bar 1")

    c = new tutorial("mock", [[1, modeName.play], [1, modeName.pause]])
    expect(()=>{c.curriculum()}).not.toThrow()

})

test('Tutorial.locked', () => {
    let c = new tutorial("mock", [
        [1, modeName.wait],
        [2, modeName.wait],
        [3, modeName.wait],
        [4, modeName.wait],
    ]).curriculum()

    let t1 = new task(0,1, hand.Right, "mock", modeFactory(modeName.wait))
    let t2 = new task(1,2, hand.Right, "mock", modeFactory(modeName.wait))
    let t3 = new task(2,3, hand.Right, "mock", modeFactory(modeName.wait))
    let t4 = new task(3,4, hand.Right, "mock", modeFactory(modeName.wait))


    expect(c.getLessons()).toEqual(["mock"])

    expect(c.next()).toEqual(t1)
    expect(c.getScore(t1)).toBe(0)
    expect(c.unlocked(t1)).toBe(true)
    expect(c.unlocked(t2)).toBe(false)
    c.recordScore(t1, 100)
    expect(c.getScore(t1)).toBe(100)
    
    expect(c.next()).toEqual(t2)
    expect(c.getScore(t2)).toBe(0)
    expect(c.unlocked(t2)).toBe(true)
    expect(c.unlocked(t3)).toBe(false)
    c.recordScore(t2, 100)
    expect(c.getScore(t2)).toBe(100)
    
    expect(c.next()).toEqual(t3)
    expect(c.getScore(t3)).toBe(0)
    expect(c.unlocked(t3)).toBe(true)
    expect(c.unlocked(t4)).toBe(false)
    c.recordScore(t3, 100)
    expect(c.getScore(t3)).toBe(100)
    
    expect(c.next()).toEqual(t4)
    expect(c.getScore(t4)).toBe(0)
    expect(c.unlocked(t4)).toBe(true)
    c.recordScore(t4, 100)
    expect(c.getScore(t4)).toBe(100)


})