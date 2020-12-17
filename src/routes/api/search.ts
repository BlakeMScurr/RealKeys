import Fuse from 'fuse.js'
var walk = require('walk');
import fs from 'fs'
import { midiLocation, midiPathToName } from '../../lib/util'

var files = [];
let fuse: Fuse<any>;
const listPath = "./assets/midi/filelist.json"
if (fs.existsSync(listPath)) {
    files = JSON.parse(fs.readFileSync(listPath).toString())
    fuse = new Fuse(files, {
        keys: ['name']
    })
} else {
    // TODO: occasionally rerun this logic even, in case the midi library changes
    var walker  = walk.walk(midiLocation, { followLinks: false });
    walker.on('file', function(root, stat, next) {
        const fname = (root + '/' + stat.name).replace(midiLocation, "")
        files.push({"path": fname, "name": midiPathToName(fname)});
        next();
    });

    walker.on('end', function() {
        fuse = new Fuse(files, {
            keys: ['name']
        })
        fs.writeFileSync(listPath, JSON.stringify(files))
    });
}

export function get(request, response) {
    // TODO: find out why we get `Cannot read property '$and' of undefined` on our first search everytime
    // TODO: find out why special characters like "'" break the search, for example, we can't search for "'", nor for "''Le Nozze" to find "./Classical Archives - The Greats (MIDI)/Mozart/K492 Overture ''Le Nozze di Figaro''.mid"
    let sq = request.query.searchQuery
    if (sq === undefined) {
        console.warn("search query undefined")
        sq = []
    }

    try {
        let result = fuse.search(sq, {limit: 5})
        response.json(JSON.stringify(result))
    } catch (e) {
        response.status(400).send({ message: "could not search"})
    }
    response.end()
}
