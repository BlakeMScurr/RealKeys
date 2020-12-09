import { blackRollKey, whiteNum, whiteRollKey } from "../../colours";
import type { Note } from "../../../lib/music/theory/notes";
import * as PIXI from 'pixi.js';


export function drawKeys(keys: Array<Note>, app: PIXI.Application, keyWidth: number, height: number) {
    keys.forEach((key, i) => {
        let keySprite = new PIXI.Graphics();
        if (key.color() === "black") {
            keySprite.beginFill(blackRollKey);
        } else {
            keySprite.beginFill(whiteRollKey);
        }
        keySprite.drawRect(i * keyWidth, 0, keyWidth, height);
        app.stage.addChild(keySprite);

        if (key.color() === "white" && i > 0 && keys[i - 1].color() === "white") {
            let separatorSprite = new PIXI.Graphics()
            keySprite.beginFill(whiteNum);
            keySprite.drawRect(i * keyWidth, 0, 1, height);
            app.stage.addChild(separatorSprite);
        }
    });
}