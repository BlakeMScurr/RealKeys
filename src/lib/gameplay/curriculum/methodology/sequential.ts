
// A SequentialCurriculum defines a tradition curriclum where a player learns a piece step by step.
// 
// Pieces are divided along three axes, and the player moves along each of these axes in turn:
// - The player learns predetermined discrete sections in order, then combines those sections bit by bit.
// - The player learns each the notes, then plays them at 75% speed, then at 100% speed.
// - The player learn each section with their right hand, then left hand, then both.

import { modeFactory, modeName } from "../../mode/mode";
import { StrictCurriculum } from "../curriculum";
import type { Curriculum } from "../curriculum";
import { hand, NewTask, task } from "../task";
import { methodologyName } from "./methodology";

export class SequentialCurriculum {
    pieces: Array<PieceBreakdown>;
    constructor(pieces: Array<PieceBreakdown>) {
        this.pieces = pieces
    }
    
    curriculum():Curriculum {
        // TODO: create the locked conditions
        let tasks = Array<task>()
        this.pieces.forEach((piece) => {
            piece.breakdown.forEach((layer) => {
                for (let i = 1; i < layer.length; i++) {
                    const startDelineator = layer[i-1];
                    const endDelineator = layer[i];
                    
                    tasks.push(NewTask(startDelineator, endDelineator, hand.Right, piece.pieceName, modeFactory(modeName.wait), methodologyName.sequential))
                    tasks.push(NewTask(startDelineator, endDelineator, hand.Right, piece.pieceName, modeFactory(modeName.atSpeed, 75), methodologyName.sequential))
                    tasks.push(NewTask(startDelineator, endDelineator, hand.Right, piece.pieceName, modeFactory(modeName.atSpeed, 100), methodologyName.sequential))

                    tasks.push(NewTask(startDelineator, endDelineator, hand.Left, piece.pieceName, modeFactory(modeName.wait), methodologyName.sequential))
                    tasks.push(NewTask(startDelineator, endDelineator, hand.Left, piece.pieceName, modeFactory(modeName.atSpeed, 75), methodologyName.sequential))
                    tasks.push(NewTask(startDelineator, endDelineator, hand.Left, piece.pieceName, modeFactory(modeName.atSpeed, 100), methodologyName.sequential))

                    tasks.push(NewTask(startDelineator, endDelineator, hand.Both, piece.pieceName, modeFactory(modeName.wait), methodologyName.sequential))
                    tasks.push(NewTask(startDelineator, endDelineator, hand.Both, piece.pieceName, modeFactory(modeName.atSpeed, 75), methodologyName.sequential))
                    tasks.push(NewTask(startDelineator, endDelineator, hand.Both, piece.pieceName, modeFactory(modeName.atSpeed, 100), methodologyName.sequential))
                }
            })
        })

        return StrictCurriculum(tasks)
    }
}

// PieceBreakdown is a hierarchical breakdown of a given piece of music
// TODO: create an alternative PieceBreakdown that's more flexible and allows any set of subdivisions
export class PieceBreakdown {
    pieceName: string;
    // The first array represents bar numbers delineating the atomic parts of the piece.
    // The subsequent arrays are also bar number delineators, which represent larger parts build out of the previous layer.
    // The final array represents the whole piece.
    breakdown: Array<Array<number>>;

    // TODO: create a more lenient breakdown composer
    constructor(pieceName: string, breakdown: Array<Array<number>>) {
        // check that the piece is divided up appropriately, i.e., check that each breakdown is a set containing the union of sections from the previous breakdown etc
        breakdown.forEach((layer, i)=>{
            if (layer.length <= 1) {
                throw new Error(`Breakdown layer has too few boundaries (${layer.length}) to delineate a section`)
            }

            if (i > 0) {
                let previousLayer = breakdown[i-1]
                if (layer[0] !== previousLayer[0] || layer[layer.length-1] !== previousLayer[previousLayer.length-1]) {
                    throw new Error(`Breakdown layers have different outer boundaries: (${previousLayer[0]},${previousLayer[previousLayer.length-1]}) vs (${layer[0]},${layer[layer.length-1]})`)
                }

                layer.forEach((boundary, boundaryIndex)=> {
                    let previousBoundarIndex = previousLayer.indexOf(boundary)
                    if (previousBoundarIndex === -1) {
                        throw new Error(`Boundary at bar ${boundary} does not exist in previous layer`)
                    }

                    if (boundaryIndex > 0) {
                        if (previousLayer[previousBoundarIndex-1] === layer[boundaryIndex-1]) {
                            throw new Error(`Section (${layer[boundaryIndex-1]},${boundary}) is not updated between two layers`)
                        }
                    }
                })
            }  
        })
        
        this.pieceName = pieceName
        this.breakdown = breakdown
    }
}