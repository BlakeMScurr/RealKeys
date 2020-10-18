export interface instrument {
    getVolume():number;
    setVolume():number;
    play(note: string);
    name():string;
}

export interface instrumentSettings {
    getVolume():number;
    setVolume():number;
    name():string;
}