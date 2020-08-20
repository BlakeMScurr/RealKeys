const { execSync } = require('child_process');
import { downloadYouTubeVideo } from "../../../backend/youtube-dl.js";
const { getAudioDurationInSeconds } = require('get-audio-duration');
const fs = require("fs");

export function get(request, response) {
    const { videoID } = request.params;
    let { cleanup, audioFile } = downloadYouTubeVideo(videoID)

    // get beats
    let rawBeats = execSync('aubiocut ' + audioFile)
    let beats = rawBeats.toString().trim().split("\n")

    // add on total length
    const stream = fs.createReadStream(audioFile);
    getAudioDurationInSeconds(stream).then((duration) => {
        beats.push(duration.toString())
        
        response.send(beats)
        cleanup()
    });
}