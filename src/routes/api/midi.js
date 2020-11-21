const path = require('path');

export function get(request, response) {
    let p = path.resolve("assets/midi/130000_Pop_Rock_Classical_Videogame_EDM_MIDI_Archive\[6_19_15\]/J/J/justin_bieber-baby.mid")
    // let p = path.resolve("assets/midi/130000_Pop_Rock_Classical_Videogame_EDM_MIDI_Archive[6_19_15]/J/J/justin_bieber-eenie_meenie_feat_sean_kingston.mid")
    response.sendFile(p)
}