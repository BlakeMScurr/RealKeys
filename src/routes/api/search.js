import Fuse from 'fuse.js'
const fs = require("fs");

// const paths = [
//     { "path": "./Classical Archives - The Greats (MIDI)/Mozart/K626 Requiem 05 Recordare.mid" },
//     { "path": "./Classical Archives - The Greats (MIDI)/Mozart/K492 Overture ''Le Nozze di Figaro''.mid" },
// ]

console.log(fs.readdirSync("."))
const paths = JSON.parse(fs.readFileSync("./assets/midi/filelist.json"))

const fuse = new Fuse(paths, {
    keys: ['path']
})

export function get(request, response) {
    // TODO: find out why we get `Cannot read property '$and' of undefined` on our first search everytime
    // TODO: find out why special characters like "'" break the search, for example, we can't search for "'", nor for "''Le Nozze" to find "./Classical Archives - The Greats (MIDI)/Mozart/K492 Overture ''Le Nozze di Figaro''.mid"

    let sq = request.query.searchQuery
    if (sq === undefined) {
        console.warn("search query undefined")
        sq = []
    }

    try {
        let result = fuse.search(sq)
        response.json(JSON.stringify(result))
    } catch (e) {
        console.warn(e)
        response.status(400).send({ message: "could not search"})
    }
    response.end()
}
