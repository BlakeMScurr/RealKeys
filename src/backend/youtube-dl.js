const { execSync } = require('child_process');
const fs = require("fs");
const path = require("path");
const rimraf = require('rimraf');

// download a youtube video based on an ID
// returns a cleanup function and a path to a file
// TODO: cache audio so we don't request it multiply
export function downloadYouTubeVideo(videoID) {
    let tmpdir = fs.mkdtempSync('temp-')

    if (fs.existsSync(tmpdir)) {
        process.chdir(tmpdir)

        execSync('youtube-dl -x --audio-format=mp3 https://www.youtube.com/watch?v=' + videoID)
        let files = fs.readdirSync("./")
        if (files.length != 1) {
            return {cleanup: cleanup(tmpdir), file: ""};
        }

        let audioFile = path.resolve("ytaudio.m4a")
        fs.renameSync(path.resolve(files[0]), audioFile)
        return {cleanup: cleanup(tmpdir), audioFile: audioFile};
    }
    return {cleanup: cleanup(tmpdir), file: ""};
    
}

function cleanup (tmpdir) {
    return () => {
        // process.chdir("..")
        // rimraf(path.resolve(tmpdir), (error) => {
        //     if (fs.existsSync(path.resolve(tmpdir))) { // TODO: why does this get called when it clearly succeeds?
        //         console.log("could not remove " + tmpdir)
        //         console.log(error)
        //     }
        // });
    }
}