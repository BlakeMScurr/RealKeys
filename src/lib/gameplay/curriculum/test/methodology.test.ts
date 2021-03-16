import { graph } from "../../../math/graph"
import { modeFactory, modeName } from "../../mode/mode"
import { compose } from "../methodology/compose"
import { methodologyName } from "../methodology/methodology"
import { PieceBreakdown, SequentialCurriculum } from "../methodology/sequential"
import { tutorial } from "../methodology/tutorial"
import { hand, NewTask, task } from "../task"

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

    let t1 = NewTask(1,2, hand.Right, "mock", modeFactory(modeName.wait), methodologyName.sequential)
    let t2 = NewTask(1,2, hand.Right, "mock", modeFactory(modeName.atSpeed, 75), methodologyName.sequential)
    let t3 = NewTask(1,2, hand.Right, "mock", modeFactory(modeName.atSpeed, 100), methodologyName.sequential)
    let t4 = NewTask(1,2, hand.Left, "mock", modeFactory(modeName.wait), methodologyName.sequential)
    let t5 = NewTask(1,2, hand.Left, "mock", modeFactory(modeName.atSpeed, 75), methodologyName.sequential)
    let t6 = NewTask(1,2, hand.Left, "mock", modeFactory(modeName.atSpeed, 100), methodologyName.sequential)
    let t7 = NewTask(1,2, hand.Both, "mock", modeFactory(modeName.wait), methodologyName.sequential)
    let t8 = NewTask(1,2, hand.Both, "mock", modeFactory(modeName.atSpeed, 75), methodologyName.sequential)
    let t9 = NewTask(1,2, hand.Both, "mock", modeFactory(modeName.atSpeed, 100), methodologyName.sequential)

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
    let c = new tutorial("mock", [[2, modeName.wait], [1, modeName.wait]])
    expect(()=>{c.curriculum()}).toThrow("end bar 1 before start bar 2")
    
    c = new tutorial("mock", [[0, modeName.wait]])
    expect(()=>{c.curriculum()}).toThrow("end bar 0 before start bar 1")

    c = new tutorial("mock", [[1, modeName.wait]])
    expect(()=>{c.curriculum()}).toThrow("end bar 1 before start bar 1")

    c = new tutorial("mock", [[2, modeName.play], [2, modeName.wait]])
    expect(()=>{c.curriculum()}).toThrow("end bar 2 before start bar 2")
})

test('Tutorial.locked', () => {
    let c = new tutorial("mock", [
        [2, modeName.wait],
        [3, modeName.wait],
        [4, modeName.wait],
        [5, modeName.wait],
    ]).curriculum()

    let t1 = NewTask(1,2, hand.Right, "mock", modeFactory(modeName.wait), methodologyName.tutorial)
    let t2 = NewTask(2,3, hand.Right, "mock", modeFactory(modeName.wait), methodologyName.tutorial)
    let t3 = NewTask(3,4, hand.Right, "mock", modeFactory(modeName.wait), methodologyName.tutorial)
    let t4 = NewTask(4,5, hand.Right, "mock", modeFactory(modeName.wait), methodologyName.tutorial)


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

test("composite_tutorial", () => {
    let a = new tutorial("first", [
        [2, modeName.wait],
        [3, modeName.wait],
    ]).curriculum()

    let b = new tutorial("second", [
        [2, modeName.wait],
        [3, modeName.wait],
    ]).curriculum()

    let c = compose([a, b], new graph([[1, 0]]).dag())

    let t1 = NewTask(1,2, hand.Right, "first", modeFactory(modeName.wait), methodologyName.tutorial)
    let t2 = NewTask(2,3, hand.Right, "first", modeFactory(modeName.wait), methodologyName.tutorial)
    let t3 = NewTask(1,2, hand.Right, "second", modeFactory(modeName.wait), methodologyName.tutorial)
    let t4 = NewTask(2,3, hand.Right, "second", modeFactory(modeName.wait), methodologyName.tutorial)

    expect(c.unlocked(t1)).toBe(true)
    expect(c.unlocked(t2)).toBe(false)
    expect(c.unlocked(t3)).toBe(false)
    expect(c.unlocked(t4)).toBe(false)

    c.recordScore(t1, 100)
    expect(c.unlocked(t1)).toBe(true)
    expect(c.unlocked(t2)).toBe(true)
    expect(c.unlocked(t3)).toBe(false)
    expect(c.unlocked(t4)).toBe(false)

    c.recordScore(t2, 100)
    expect(c.unlocked(t1)).toBe(true)
    expect(c.unlocked(t2)).toBe(true)
    expect(c.unlocked(t3)).toBe(true)
    expect(c.unlocked(t4)).toBe(false)

    c.recordScore(t3, 100)
    expect(c.unlocked(t1)).toBe(true)
    expect(c.unlocked(t2)).toBe(true)
    expect(c.unlocked(t3)).toBe(true)
    expect(c.unlocked(t4)).toBe(true)
})

test("composite_mixed", () => {
    let a = new tutorial("tutorial", [
        [2, modeName.wait],
    ]).curriculum()

    let b = new SequentialCurriculum([new PieceBreakdown("piece", [[1,2]])]).curriculum()

    let t0 = NewTask(1,2, hand.Right, "tutorial", modeFactory(modeName.wait), methodologyName.tutorial)
    let t1 = NewTask(1,2, hand.Right, "piece", modeFactory(modeName.wait), methodologyName.sequential)
    let t2 = NewTask(1,2, hand.Right, "piece", modeFactory(modeName.atSpeed, 75), methodologyName.sequential)

    let c = compose([a, b], new graph([[1, 0]]))
    
    // What was unlocked in b now requires a to be complete in order to be started
    expect(c.unlocked(t1)).toBe(false)
    expect(b.unlocked(t1)).toBe(true)
    
    // complete the tutorial
    expect(c.unlocked(t0)).toBe(true)
    expect(c.getScore(t0)).toBe(0)
    c.recordScore(t0, 100)

    // now the piece is ready to be learned
    expect(c.unlocked(t1)).toBe(true)
    expect(c.unlocked(t2)).toBe(false)
    expect(c.getScore(t1)).toBe(0)
    c.recordScore(t1, 100)

    // proceed to the next part of learning the piece as normal
    expect(c.unlocked(t2)).toBe(true)
    expect(c.getScore(t2)).toBe(0)
})