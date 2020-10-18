import { Howl } from 'howler';
import { pianoNotes, Note } from '../../lib/music/theory/notes';

export function newPiano():instrument {
    return newHowlerInstrument(pianoSounds)
}

// maps from names of sounds to the urls where they'll be found
// Maps from note names to urls
const pianoSounds:Array<string> = makePianoSounds()
function makePianoSounds() {
    let notes = new Array<string>()
    pianoNotes().forEach(note => {
        notes.push(asFlat(note))
    });
    return notes
}

function asFlat(note: Note) {
    let n = note.abstract.enharmonicEquivalent()
    return n.charAt(0).toUpperCase() + n.slice(1) + note.octave;
}

// TODO: metronome

function newHowlerInstrument(notes: Array<string>):instrument {
    let player = new instrument();

    notes.forEach((note)=>{
        let h;
        h = new Howl({
            src: "getSound/" + note + ".wav",
            format: 'wav',
            html5: true, // html5 being forced gives us rate change without pitch increase as per https://github.com/goldfire/howler.js/issues/586#issuecomment-237240859
            onload: ()=> {
                player.addSound(note, h)
            }
        })
    })

    return player;

}

class instrument {
    sounds: Map<string, any>; // TODO: use howl type

    constructor () {
        this.sounds = new Map();
    }

    addSound(note: string, sound: any) {
        this.sounds.set(note, sound)
    }

    stop(note: Note) {
        let n = asFlat(note)
        if (this.sounds.has(n)) {
            this.sounds.get(n).fade(1, 0, 200)
        }
    }

    play(note: Note) {
        let n = asFlat(note)
        if (this.sounds.has(n)) {
            let s = this.sounds.get(n)
            s.play()
            s.fade(0, 1, 1)
        } else {
            console.warn("couldn't play", note)
        }
    }
}