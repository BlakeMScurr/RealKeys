import { modeFactory, modeName } from "../../mode/mode"
import { PieceBreakdown, SequentialCurriculum } from "../methodology"
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