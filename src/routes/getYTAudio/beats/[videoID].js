const { execSync } = require('child_process');
import { downloadYouTubeVideo } from "../../../backend/youtube-dl.js";
const { getAudioDurationInSeconds } = require('get-audio-duration');
const fs = require("fs");
const path = require("path");
const rimraf = require('rimraf');

export function get(request, response) {
    const { videoID } = request.params;
    let { cleanup, audioFile } = downloadYouTubeVideo(videoID)

    // get beats
    let rawBeats = execSync('aubiocut ' + audioFile)
    let beats = rawBeats.toString().trim().split("\n")

    // add on total length
    // convert to m4a to get length on mac
    execSync('ffmpeg -y -i ' + audioFile + " " + audioFile + ".m4a") // TODO: it's a bit ugly to have x.mp3..m4a so we should remove this whole hack
    const stream = fs.createReadStream(audioFile + ".m4a");
    getAudioDurationInSeconds(stream).then((duration) => {
        beats.push(duration.toString())
        
        response.send(beats)
        cleanup()
        if (videoID.startsWith("testdata-")) { // cleanup will not delete testdata, so we delete the new mp4 manually
            rimraf(path.resolve(audioFile + ".m4a"), (error) => {
                console.log("could not remove " + audioFile + ".m4a")
                console.log(error)
            });
        }
    });
}