// TODO: import as normal
// TODO: get typescript definition and replace all references to "any" type in this file with "Fraction", or whatever the type is
var Fraction = require('fraction.js');

// TODO: merge this will all the places we're using bars in the ZoomBars thign
export class Bars {
    bars: Array<any>;
    constructor(bars: Array<any>) {
        let sum = bars.reduce((prev, curr) => {
            return prev.add(curr)
        }, new Fraction(0));
        if (sum != 1) {
            throw new Error("Bars don't sum to 1: " + sum)
        }


        this.bars = bars
    }

    barLines():Array<number> {
        let starts:Array<number> = [];
        let sum = Fraction(0);
        this.bars.forEach(barLength => {
            starts.push(sum)
            sum = sum.add(barLength)
        });
        starts.push(sum)
        return starts
    }

    sums():Array<number> {
        let sum = 0;
        let newBars:Array<number> = [];
        this.bars.forEach(bar => {
            sum += bar
            newBars.push(sum)
        });
        return newBars
    }
}