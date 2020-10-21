import type { Note } from "../lib/music/theory/notes";

export interface instrument {
    getVolume():number;
    setVolume(number);
    play(note: Note);
    name():string;
}

export interface instrumentSettings {
    getVolume():number;
    setVolume():number;
    name():string;
}