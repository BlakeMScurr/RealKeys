// a builder is a highly general method to define a curriculum, builders are generally the output of the makeTutorial interface

import { graph } from "../../../math/graph";
import { getProgress } from "../../../storage";
import { mapStringifyReviver } from "../../../util";
import { modeName } from "../../mode/mode";
import type { Curriculum } from "../curriculum";
import { compose } from "./compose";
import { PieceBreakdown, SequentialCurriculum } from "./sequential";
import { tutorial } from "./tutorial";

export class section {
    startBar: number;
    endBar: number;
    text: string;
    mode: modeName;

    constructor(startBar: number, endBar: number) {
        this.startBar = startBar
        this.endBar = endBar
        this.text = ""
        this.mode = modeName.wait
    }
}

export class rangeDefintion {
    defaultRange: boolean;
    lowestPitch: string;
    lowestOctave: number;
    highestPitch: string;
    highestNumber: number;
 
    constructor(defaultRange: boolean, lowestPitch: string, lowestOctave: number, highestPitch: string, highestNumber: number) {
        this.defaultRange = defaultRange;
        this.lowestPitch = lowestPitch;
        this.lowestOctave = lowestOctave;
        this.highestPitch = highestPitch;
        this.highestNumber = highestNumber;
    }
}

export class blueprints {
    sections: Map<string, Array<section>>
    curriculumNames: Array<string>
    deps:  Array<[number, number]>
    sequential: Map<string, boolean>

    constructor(sections: Map<string, Array<section>>, curriculumNames: Array<string>, deps:  Array<[number, number]>, sequential: Map<string, boolean>) {
        this.sections = sections
        this.curriculumNames = curriculumNames
        this.deps = deps
        this.sequential = sequential
    }

    Curriculum():Curriculum {
        let curriculae: Array<Curriculum> = []
        this.curriculumNames.forEach((name) => {
            if (this.sequential.get(name)) {
                let breakPoints = new Array<Array<number>>();
                breakPoints[0] = this.sections.get(name).map((section) => {
                    return section.endBar
                })
                breakPoints[0].unshift(1) // add the first bar
                breakPoints[1] = [1, breakPoints[0][breakPoints[0].length-1]] // section for the whole piece
                curriculae.push(new SequentialCurriculum([new PieceBreakdown(name, breakPoints)]).curriculum())
            } else {
                // TODO: remove this +1 thing, seems bad
                // TODO: why does it think the type could is Array<[number | modeName]> if I don't just force it? (the difference being | vs ,)
                let tutSecs: Array<[number, modeName]> = this.sections.get(name).map((section)=>{return [section.endBar + 1, section.mode]})
                curriculae.push(new tutorial(name, tutSecs).curriculum())
            }
        })

        return compose(curriculae, new graph(this.deps).dag())
    }
}

export function build (courseName: string):Promise<blueprints> {
    return fetch("api/course?name=" + courseName).then((f) => {
        return f.text()
    }).then((f) => {
        let j = JSON.parse(f, mapStringifyReviver)
        return new blueprints(j.sections, j.curriculae, j.deps, j.sequential)
    })
}