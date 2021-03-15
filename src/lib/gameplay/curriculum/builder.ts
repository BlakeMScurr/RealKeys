import { modeName } from "../mode/mode";

export class section {
    startBar: number;
    endBar: number;
    text: string;
    mode: modeName;

    constructor(startBar: number, endBar: number) {
        this.startBar = startBar
        this.endBar = endBar
        this.text = ""
        this.mode = modeName.wait
    }
}