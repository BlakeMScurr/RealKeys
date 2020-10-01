import { Recorder, TimedNotes } from "../../lib/music/timed/timed"

// Manages the state while recording notes
// TODO: change name and think more carefully about state handling - this was just yoinked from the pianoroll component when it got too messy
export class RecordState {
    tmpNotes:TimedNotes;
    private notes: TimedNotes;
    recorder:Recorder;

    constructor(notes: TimedNotes) {
        this.notes = notes
    }

    getNotes () {
        if (this.notes === undefined) {
            return new TimedNotes([])
        }
        return this.notes
    }

    startRecording(pos: number){
        
        this.recorder = new Recorder();
        // TODO: add a big red line at the top of the page
        this.recorder.start(pos);
        this.tmpNotes = this.notes
        // TODO: show previous notes while recording
        this.notes = this.recorder.getNotes()
        return this.getNotes()
    }

    stopRecording(pos: number, withMerge: boolean) {
        if (this.recorder !== undefined) {
            this.recorder.stop(pos)
            // TODO: merge newly recorded notes
            if (withMerge) {
                this.notes = this.recorder.merge(this.tmpNotes);
            }
            this.recorder = undefined;
        }
        return this.getNotes()
    }
    
    noteOn(event, pos: number) {
        if (this.recorder !== undefined) {
            // TODO: consistent up/down off/on naming - we only need one pair
            this.recorder.down(event.detail, pos)
            this.notes = this.recorder.getNotes()
        }
        return this.getNotes()
    }
    
    noteOff(event, pos: number) {
        if (this.recorder !== undefined) {
            this.recorder.up(event.detail, pos)
            this.notes = this.recorder.getNotes()
        }
        return this.getNotes()
    }
}

