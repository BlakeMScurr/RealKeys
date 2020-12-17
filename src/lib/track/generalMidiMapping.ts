import type { InstrumentName } from 'soundfont-player';

// TODO: figure out a way to do this without copying this code, this will likely break with any update to the soundfont library
export function instrumentName(num: number):InstrumentName {
    let n = num
    if (n > 127 || n < 0) {
        console.warn("instrument number", n, "out of general midi range, setting n to 1 instead")
        n = 0
    }
    
    let wikipediaName = GeneralMidiMap[n]
    if (wikipediaName === undefined) {
        const defaultName = "Acoustic Grand Piano"
        console.warn("midi instrument for number", n, "undefined, using default", defaultName)
        wikipediaName = defaultName
    }

    // soundfont-player roughly seems to use camel case
    let soundfontName = wikipediaName.replace(/ /g, "_")
    soundfontName = soundfontName.replace(/\(/g, "")
    soundfontName = soundfontName.replace(/\)/g, "")
    soundfontName = soundfontName.toLocaleLowerCase()

    if (AllowedTypes.indexOf(soundfontName) === -1) {
        const defaultName = "acoustic_grand_piano"
        console.warn("soundfont-player doesn't have instrument named", soundfontName, "using default", defaultName)
        soundfontName = "acoustic_grand_piano"
    }

    return <InstrumentName>soundfontName
}

// From soundfont library's type file
// TODO: figure out a way to do this without copying this code, this will likely break with any update to the soundfont library
let AllowedTypes = ["accordion", "acoustic_bass", "acoustic_grand_piano", "acoustic_guitar_nylon", "acoustic_guitar_steel", "agogo", "alto_sax", "applause", "bagpipe", "banjo", "baritone_sax", "bassoon", "bird_tweet", "blown_bottle", "brass_section", "breath_noise", "bright_acoustic_piano", "celesta", "cello", "choir_aahs", "church_organ", "clarinet", "clavinet", "contrabass", "distortion_guitar", "drawbar_organ", "dulcimer", "electric_bass_finger", "electric_bass_pick", "electric_grand_piano", "electric_guitar_clean", "electric_guitar_jazz", "electric_guitar_muted", "electric_piano_1", "electric_piano_2", "english_horn", "fiddle", "flute", "french_horn", "fretless_bass", "fx_1_rain", "fx_2_soundtrack", "fx_3_crystal", "fx_4_atmosphere", "fx_5_brightness", "fx_6_goblins", "fx_7_echoes", "fx_8_scifi", "glockenspiel", "guitar_fret_noise", "guitar_harmonics", "gunshot", "harmonica", "harpsichord", "helicopter", "honkytonk_piano", "kalimba", "koto", "lead_1_square", "lead_2_sawtooth", "lead_3_calliope", "lead_4_chiff", "lead_5_charang", "lead_6_voice", "lead_7_fifths", "lead_8_bass__lead", "marimba", "melodic_tom", "music_box", "muted_trumpet", "oboe", "ocarina", "orchestra_hit", "orchestral_harp", "overdriven_guitar", "pad_1_new_age", "pad_2_warm", "pad_3_polysynth", "pad_4_choir", "pad_5_bowed", "pad_6_metallic", "pad_7_halo", "pad_8_sweep", "pan_flute", "percussive_organ", "piccolo", "pizzicato_strings", "recorder", "reed_organ", "reverse_cymbal", "rock_organ", "seashore", "shakuhachi", "shamisen", "shanai", "sitar", "slap_bass_1", "slap_bass_2", "soprano_sax", "steel_drums", "string_ensemble_1", "string_ensemble_2", "synth_bass_1", "synth_bass_2", "synth_brass_1", "synth_brass_2", "synth_choir", "synth_drum", "synth_strings_1", "synth_strings_2", "taiko_drum", "tango_accordion", "telephone_ring", "tenor_sax", "timpani", "tinkle_bell", "tremolo_strings", "trombone", "trumpet", "tuba", "tubular_bells", "vibraphone", "viola", "violin", "voice_oohs", "whistle", "woodblock", "xylophone"]

// From https://en.wikipedia.org/wiki/General_MIDI, but zero based
let GeneralMidiMap = [
    "Acoustic Grand Piano",
    "Bright Acoustic Piano",
    "Electric Grand Piano",
    "Honky-tonk Piano",
    "Electric Piano 1",
    "Electric Piano 2",
    "Harpsichord",
    "Clavi",
    "Celesta",
    "Glockenspiel",
    "Music Box",
    "Vibraphone",
    "Marimba",
    "Xylophone",
    "Tubular Bells",
    "Dulcimer",
    "Drawbar Organ",
    "Percussive Organ",
    "Rock Organ",
    "Church Organ",
    "Reed Organ",
    "Accordion",
    "Harmonica",
    "Tango Accordion",
    "Acoustic Guitar (nylon)",
    "Acoustic Guitar (steel)",
    "Electric Guitar (jazz)",
    "Electric Guitar (clean)",
    "Electric Guitar (muted)",
    "Overdriven Guitar",
    "Distortion Guitar",
    "Guitar Harmonics",
    "Acoustic Bass",
    "Electric Bass (finger)",
    "Electric Bass (pick)",
    "Fretless Bass",
    "Slap Bass 1",
    "Slap Bass 2",
    "Synth Bass 1",
    "Synth Bass 2",
    "Violin",
    "Viola",
    "Cello",
    "Contrabass",
    "Tremolo Strings",
    "Pizzicato Strings",
    "Orchestral Harp",
    "Timpani",
    "String Ensemble 1",
    "String Ensemble 2",
    "Synth Strings 1",
    "Synth Strings 2",
    "Choir Aahs",
    "Voice Oohs",
    "Synth Voice",
    "Orchestra Hit",
    "Trumpet",
    "Trombone",
    "Tuba",
    "Muted Trumpet",
    "French Horn",
    "Brass Section",
    "Synth Brass 1",
    "Synth Brass 2",
    "Soprano Sax",
    "Alto Sax",
    "Tenor Sax",
    "Baritone Sax",
    "Oboe",
    "English Horn",
    "Bassoon",
    "Clarinet",
    "Piccolo",
    "Flute",
    "Recorder",
    "Pan Flute",
    "Blown bottle",
    "Shakuhachi",
    "Whistle",
    "Ocarina",
    "Lead 1 (square)",
    "Lead 2 (sawtooth)",
    "Lead 3 (calliope)",
    "Lead 4 (chiff)",
    "Lead 5 (charang)",
    "Lead 6 (voice)",
    "Lead 7 (fifths)",
    "Lead 8 (bass + lead)",
    "Pad 1 (new age)",
    "Pad 2 (warm)",
    "Pad 3 (polysynth)",
    "Pad 4 (choir)",
    "Pad 5 (bowed)",
    "Pad 6 (metallic)",
    "Pad 7 (halo)",
    "Pad 8 (sweep)",
    "FX 1 (rain)",
    "FX 2 (soundtrack)",
    "FX 3 (crystal)",
    "FX 4 (atmosphere)",
    "FX 5 (brightness)",
    "FX 6 (goblins)",
    "FX 7 (echoes)",
    "FX 8 (sci-fi)",
    "Sitar",
    "Banjo",
    "Shamisen",
    "Koto",
    "Kalimba",
    "Bag pipe",
    "Fiddle",
    "Shanai",
    "Tinkle Bell",
    "Agogô",
    "Steel Drums",
    "Woodblock",
    "Taiko Drum",
    "Melodic Tom",
    "Synth Drum",
    "Reverse Cymbal",
    "Guitar Fret Noise",
    "Breath Noise",
    "Seashore",
    "Bird Tweet",
    "Telephone Ring",
    "Helicopter",
    "Applause",
    "Gunshot",
]