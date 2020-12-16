import { barLineGrey, blackRollKey, niceBlueNum, whiteNum, whiteRollKey } from "../../colours";
import type { Note } from "../../../lib/music/theory/notes";
import type { TimedNotes } from "../../../lib/music/timed/timed";
import * as PIXI from 'pixi.js';
import type { Bars } from "../pianoRollHelpers";
import { keyIndex } from "./roll.ts";

export function drawBarLines(bars: Bars, container: PIXI.Container, width: number, height: number, zoom: number) {
    let sum = 0;
    bars.bars.forEach((bar) => {
        let barGraphic = new PIXI.Graphics();
        container.addChild(barGraphic)
        barGraphic.beginFill(barLineGrey);
        barGraphic.drawRect(0, (1-(sum / zoom)) * height, width, 1)
        sum += bar
        
    })
}

export function drawNotes(notes: TimedNotes, container: PIXI.Container, keys, keyWidth: number, height: number, zoom: number){
    notes.notes.forEach((note) => {
        let noteGraphic = new PIXI.Graphics();
        container.addChild(noteGraphic)
        noteGraphic.beginFill(niceBlueNum)
        let noteLen = note.end - note.start
        noteGraphic.drawRoundedRect(keyWidth * keyIndex(keys, note.note), (1-(note.end / zoom)) * height, keyWidth, noteLen * height / zoom, keyWidth / 5)
    })
}

export function drawKeys(keys: Array<Note>, container: PIXI.Container, keyWidth: number, height: number) {
    keys.forEach((key, i) => {
        let keyGraphic = new PIXI.Graphics();
        container.addChild(keyGraphic);
        if (key.color() === "black") {
            keyGraphic.beginFill(blackRollKey);
        } else {
            keyGraphic.beginFill(whiteRollKey);
        }
        keyGraphic.drawRect(i * keyWidth, 0, keyWidth, height);

        if (key.color() === "white" && i > 0 && keys[i - 1].color() === "white") {
            let separatorSprite = new PIXI.Graphics()
            keyGraphic.beginFill(whiteNum);
            keyGraphic.drawRect(i * keyWidth, 0, 1, height);
            container.addChild(separatorSprite);
        }
    });
}