import { ChordBook } from "../../lib/music/theory/chords";
import type { Note } from "../../lib/music/theory/notes";

const fetch = require("node-fetch")
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

const ugURL = "https://tabs.ultimate-guitar.com/tab/"

export async function get(request, response) {
    let ugresp = await fetch(ugURL + request.query.path)

    if (ugresp.status !== 200) {
        response.status(400)
        response.send({error: "Couldn't find song: \"" + request.query.path + "\""})
        return
    }

    let page = await (ugresp).text()
    const dom = new JSDOM(page);
    let rawChordChart: string = dom.window.document.getElementsByTagName("div")[2].getAttribute("data-content") // TODO: use the data-store class name, rather than the 3rd div, idk why that isn't working
    let chordFinder = /\[ch\](.*?)\[\/ch\]/g;

    let m;
    let chordNames = []
    do {
        m = chordFinder.exec(rawChordChart);
        if (m) {
            chordNames.push(m[1])
        }
    } while (m);

    chordNames = chordNames.filter((value, index, self) => {
        return self.indexOf(value) === index;
    });

    let cb = new ChordBook()
    let transpositionWithMinAccidentals = -1
    let minAccidentals = 1000000000000000000 // BIG BIG NUMBER

    let capo = 0
    // let capoFinder = /capo&quot;:([0-9]*)/g;
    let capoFinder = /capo":([0-9]+),/g;
    m = capoFinder.exec(rawChordChart)
    if (m) {
        capo = parseInt(m[1])
    }

    for (let transpose = 0; transpose < 12; transpose++) {
        let accidentals = 0
        chordNames.forEach((chordName) => {
            let chord = cb.infer(chordName)[0]
    
            chord.notes.forEach((note: Note) => {
                if (note.jump(transpose+capo).getAbstract().accidental) accidentals++
            });
        })

        if (accidentals < minAccidentals) {
            transpositionWithMinAccidentals = transpose
            minAccidentals = accidentals
        }
    }

    response.send({"transposeUp": transpositionWithMinAccidentals})
}