const { execSync } = require('child_process');
const fs = require("fs");
import { pathToAudioFile } from "../lib/util.ts"

// download a youtube video based on an ID
export function downloadYouTubeVideo(videoID) {
    if (!fs.existsSync(pathToAudioFile(videoID))) {
        execSync('youtube-dl -x --audio-format=mp3 -o ' + pathToAudioFile(videoID) + ' https://www.youtube.com/watch?v=' + videoID)
    }
}