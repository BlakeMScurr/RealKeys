import { Recorder, TimedNotes } from "../../lib/music/timed/timed"
import { currentSong } from "../stores"

// Manages the state while recording notes
// TODO: change name and think more carefully about state handling - this was just yoinked from the pianoroll component when it got too messy
export class RecordState {
    tmpNotes:TimedNotes;
    notes: TimedNotes;
    recorder:Recorder;

    constructor(notes: TimedNotes) {
        this.notes = notes
    }

    startRecording(pos: number){
        this.recorder = new Recorder();
        // TODO: add a big red line at the top of the page
        this.recorder.start(pos);
        this.tmpNotes = this.notes
        // TODO: show previous notes while recording
        this.notes = this.recorder.getNotes()
        return this.notes
    }

    stopRecording(pos: number) {
        this.recorder.stop(pos)
        // TODO: merge newly recorded notes
        this.notes = this.recorder.merge(this.tmpNotes);
        this.recorder = null;
        currentSong.set(this.notes)
        return this.notes
    }
    
    noteOn(event, pos: number) {
        if (this.recorder !== undefined) {
            // TODO: consistent up/down off/on naming - we only need one pair
            this.recorder.down(event.detail, pos)
            this.notes = this.recorder.getNotes()
        }
        return this.notes
    }
    
    noteOff(event, pos: number) {
        if (this.recorder !== undefined) {
            this.recorder.up(event.detail, pos)
            this.notes = this.recorder.getNotes()
        }
        return this.notes
    }
}

