const path = require('path');

export function get(request, response) {
    let p = path.resolve("assets/midi/130000_Pop_Rock_Classical_Videogame_EDM_MIDI_Archive\[6_19_15\]/" + request.query.path)
    response.sendFile(p)
}