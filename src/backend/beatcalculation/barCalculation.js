const { execSync } = require('child_process');
import { pathToAudioFile } from "../../lib/util.js"
import { createEvenBars } from "../../components/bars/edit/editBars.js"
import { calculateBeats } from "./beatcalculation.js";
const { getAudioDurationInSeconds } = require('get-audio-duration');
const fs = require("fs");

export async function calculateBars(videoID) {
    // convert formats as needed by various tools
    const audioFile = pathToAudioFile(videoID)
    const tmpm4a = audioFile + ".m4a"
    const tmpwav = audioFile + ".wav"
    execSync('ffmpeg -y -i ' + audioFile + " " + tmpwav, {stdio: "pipe"})
    execSync('ffmpeg -y -i ' + audioFile + " " + tmpm4a, {stdio: "pipe"})
    
    // run beat detection algorithm
    let rawBpm = execSync("bpmdetection.sh " + tmpwav, {stdio: "pipe"}).toString()
    let bpm = parseFloat(rawBpm.split("Estimated Beats Per Minute: ")[1])

    // get pulses
    let rawPulses = execSync('aubiocut ' + tmpwav, {stdio: "pipe"})
    let pulses = rawPulses.toString().trim().split("\n")
    let duration = await getAudioDurationInSeconds(fs.createReadStream(tmpm4a)) // add bookend bar - requires m4a on mac

    // remove temporary alternative formats 
    fs.unlinkSync(tmpm4a)
    fs.unlinkSync(tmpwav)

    // parse as bars
    // TODO: use anchor pulse finder, not beat calculator
    let beats = createEvenBars(calculateBeats(pulses, bpm)[0], bpm, duration)

    return beats
}