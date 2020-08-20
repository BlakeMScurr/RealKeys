const { execSync } = require('child_process');
import { downloadYouTubeVideo } from "../../../backend/youtube-dl.js";

export function get(request, response) {
    const { videoID } = request.params;
    let { cleanup, audioFile } = downloadYouTubeVideo(videoID)
    let beats = execSync('aubiocut ' + audioFile)
    response.send(beats.toString().trim().split("\n"))
    cleanup()
}