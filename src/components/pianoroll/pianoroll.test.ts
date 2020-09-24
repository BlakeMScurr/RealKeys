import { Bars } from "./pianoroll"
var Fraction = require('fraction.js');

function fifthBars():Bars {
    return new Bars([new Fraction('1/5'), new Fraction('1/5'), new Fraction('1/5'), new Fraction('1/5'), new Fraction('1/5')])
}

test("barLines", ()=>{
    expect(fifthBars().barLines()).toEqual([new Fraction(0), new Fraction("1/5"), new Fraction("2/5"), new Fraction("3/5"), new Fraction("4/5"), new Fraction("1")])
})