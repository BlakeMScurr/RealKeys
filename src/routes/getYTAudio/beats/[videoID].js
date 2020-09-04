const { execSync } = require('child_process');
import { downloadYouTubeVideo } from "../../../backend/youtube-dl.js";
import { calculateBeats } from "../../../backend/beatcalculation/beatcalculation.js"
const { getAudioDurationInSeconds } = require('get-audio-duration');
const fs = require("fs");
const path = require("path");
const rimraf = require('rimraf');

export function get(request, response) {
    const { videoID } = request.params;
    let { cleanup, audioFile } = downloadYouTubeVideo(videoID)
    
    // get pulses
    console.log("getting pulses")
    let rawPulses = execSync('aubiocut ' + audioFile)
    let pulses = rawPulses.toString().trim().split("\n")

    // add on total length
    // convert to m4a to get length on mac
    console.log("getting audio length")
    execSync('ffmpeg -y -i ' + audioFile + " " + audioFile + ".m4a") // TODO: it's a bit ugly to have x.mp3..m4a so we should remove this whole hack
    const stream = fs.createReadStream(audioFile + ".m4a");
    getAudioDurationInSeconds(stream).then((duration) => {
        pulses.push(duration.toString())
        
        console.log("getting bpm")
        execSync('ffmpeg -y -i ' + audioFile + " " + audioFile + ".wav")
        let rawBpm = execSync("bpmdetection.sh " + audioFile + ".wav").toString()
        let bpm = parseFloat(rawBpm.split("Estimated Beats Per Minute: ")[1])
        console.log("getting beats")
        console.log("pluses and bpm:")
        console.log(JSON.stringify(pulses), bpm)
        let beats = calculateBeats(pulses.map((pulse)=>{return parseFloat(pulse)}), bpm)
        console.log("sending beats")
        console.log(beats)
        response.send(beats)

        // cleanup
        cleanup()
        if (videoID.startsWith("testdata-")) { // cleanup will not delete testdata, so we delete the new mp4 manually
            rimraf(path.resolve(audioFile + ".m4a"), (error) => {
                console.log("could not remove " + audioFile + ".m4a")
                console.log(error)
            });
        }
    });
}