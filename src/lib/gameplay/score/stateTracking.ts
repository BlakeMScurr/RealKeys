import type { Note } from "../../music/theory/notes";

// getKeyState combines the expected noteState from the track with user input, to determine whether the user is currently playing the note correctly or not.
// TODO: surely make it more concise, especially removing arguments
export function getKeyState(note: Note, activeMap: Map<Note, boolean>, usedNotes: Map<string, boolean>, on: boolean) {
    if (activeMap.get(note) && on) {
        return keyState.active
    }
    return usedNotes.get(note.string()) ? keyState.highlighted : keyState.inactive
}

export enum keyState {
    active,
    inactive,
    highlighted
}