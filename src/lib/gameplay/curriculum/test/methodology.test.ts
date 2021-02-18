import { PieceBreakdown } from "../methodology"

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