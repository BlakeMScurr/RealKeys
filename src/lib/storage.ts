const settingsKey = "settings"
export function getSettings() {
    return localStorage.getItem(settingsKey)
}

export function setSettings(t: inputType) {
    localStorage.setItem(settingsKey, t)
}


export enum inputType {
    midi = "MIDI Keyboard",
    qwerty = "QWERTY Keyboard",
    touch = "Touch/Click",
}