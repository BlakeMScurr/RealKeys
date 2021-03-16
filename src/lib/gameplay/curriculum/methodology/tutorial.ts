import { makeMode, modeName } from "../../mode/mode";
import { curriculum } from "../curriculum";
import { hand, NewTask, task } from "../task";
import { methodologyName } from "./methodology";

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
        let startBar = 1
        this.sections.forEach((section: [number, modeName], i: number) => {
            if (section[0] <= startBar) { // you have to proceed through the bars in each section
                throw new Error(`end bar ${section[0]} before start bar ${startBar}`)
            }
            // TODO: generalise to different hands
            tasks.push(NewTask(startBar, section[0], hand.Right, this.midiURL, makeMode(section[1]), methodologyName.tutorial))
            startBar = section[0]
        })

        let deps = new Map<task, Array<task>>()
        for (let i = 1; i < tasks.length; i++) {
            deps.set(tasks[i], [tasks[i-1]])
        }

        return new curriculum(tasks, deps)
    }
}