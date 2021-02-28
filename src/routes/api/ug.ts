import { Chord, ChordBook } from "../../lib/music/theory/chords";
import type { Note } from "../../lib/music/theory/notes";

const fetch = require("node-fetch")
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

const allStar = "https://tabs.ultimate-guitar.com/tab/smash-mouth/all-star-chords-428803"

export async function get(request, response) {
    let page = await (await fetch(allStar)).text()
    const dom = new JSDOM(page);
    let rawChordChart: string = dom.window.document.getElementsByTagName("div")[2].getAttribute("data-content") // TODO: use the data-store class name, rather than the 3rd div, idk why that isn't working
    let chordFinder = /\[ch\](.*?)\[\/ch\]/g;

    let m;
    let chorNames = []
    do {
        m = chordFinder.exec(rawChordChart);
        if (m) {
            chorNames.push(m[1])
        }
    } while (m);

    chorNames = chorNames.filter((value, index, self) => {
        return self.indexOf(value) === index;
    });

    let cb = new ChordBook()
    let transpositionWithMinAccidentals = -1
    let minAccidentals = 1000000000000000000 // BIG BIG NUMBER

    for (let transpose = 0; transpose < 12; transpose++) {
        let accidentals = 0
        chorNames.forEach((chordName) => {
            let chord = cb.infer(chordName)[0]
    
            chord.notes.forEach((note: Note) => {
                if (note.jump(transpose).getAbstract().accidental) accidentals++
            });
        })

        console.log(accidentals, "accidentals for transpose", transpose)
        if (accidentals < minAccidentals) {
            transpositionWithMinAccidentals = transpose
            minAccidentals = accidentals
        }
    }

    console.log("should transpose up", transpositionWithMinAccidentals)
    response.send({"transposeUp": transpositionWithMinAccidentals})
}