// A (teaching) methodology is a means of building a Curriculum out of a content.
import type { Curriculum } from "../curriculum";

export interface methodology {
    Curriculum():Curriculum
}

export function makeMethodology(name: string):methodologyName {
    switch(name) {
        case "sequential":
            return methodologyName.sequential
        case "tutorial":
            return methodologyName.tutorial
        case "none":
            return methodologyName.none
        default:
            throw new Error(`no methodology called: ${name}`)
    }
}


export enum methodologyName {
    sequential = "sequential",
    tutorial = "tutorial",
    none = "none",
}