import { widthSum } from "../../lib/util"


// TODO: move all of bars.js here
export enum BarType {
    Default = 1,
    Start,
    End
}

export class Bar {
    type: String; // TODO: use BarType
    width: number;
    number: number;
    constructor(type: String, width: number, number: number) {
        this.type = type;
        this.width = width;
        this.number = number;
    }
}

// takes strings representing bar line types and returns evenly spaced barlines
export function even(barlines: Array<String>):Array<Bar> {
    let b = barlines.map((type, i) => {
        return new Bar(type, 1 / (barlines.length - 1), i + 1)
    })

    b[b.length-1].width = 0 // last barline has no following width

    // correct imperfect js arithmetic by adding or subtracting from the first bar
    let totalWidth = widthSum(b)
    b[0].width += 1 - totalWidth

    return b.map((bar) => {
        // TODO: return actual bar class
        return {
            type: bar.type,
            width: bar.width,
            number: bar.number,
        }
    })
}
