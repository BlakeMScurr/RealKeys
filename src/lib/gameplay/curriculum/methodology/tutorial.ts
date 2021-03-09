import { makeMode, modeName } from "../../mode/mode";
import { curriculum } from "../curriculum";
import { hand, NewTask, task } from "../task";

// a tutorial produces is a curriculum that walks through a given MIDI file using various modalities for each section
export class tutorial {
    midiURL: string;
    sections: Array<[number, modeName]>;

    constructor(midiURL: string, sections: Array<[number, modeName]>) {
        this.midiURL = midiURL
        this.sections = sections

    }

    curriculum():curriculum {
        let tasks = new Array<task>();
        let startBar = 0
        this.sections.forEach((section: [number, modeName], i: number) => {
            if (section[0] <= startBar && section[1] !== modeName.pause) { // you have to proceed throw the bars in each section unless that section specifically pauses progress intentionally to show you something on screen
                throw new Error(`end bar ${section[0]} before start bar ${startBar}`)
            }
            // TODO: generalise to different hands
            tasks.push(NewTask(startBar, section[0], hand.Right, this.midiURL, makeMode(section[1])))
            startBar = section[0]
        })

        let deps = new Map<task, Array<task>>()
        for (let i = 1; i < tasks.length; i++) {
            deps.set(tasks[i], [tasks[i-1]])
        }

        return new curriculum(tasks, deps)
    }
}