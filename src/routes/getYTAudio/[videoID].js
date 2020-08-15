const { exec } = require('child_process');
const fs = require("fs");
const path = require("path");
const rimraf = require('rimraf');

export function get(request, response) {
    const { videoID } = request.params;
    fs.mkdtemp('temp-', (err, tmpdir) => {
        const cleanup = () => {
            process.chdir("..")
            rimraf(path.resolve(tmpdir), (error) => {
                if (fs.existsSync(path.resolve(tmpdir))) { // TODO: why does this get called when it clearly succeeds?
                    console.log("could not remove " + tmpdir)
                    console.log(error)
                }
            });
        }

        if (fs.existsSync(tmpdir)) {
            process.chdir(tmpdir)

            exec('youtube-dl -x https://www.youtube.com/watch?v=' + videoID, (err, stdout, stderr) => {
                if (err) {
                    // node couldn't execute the command
                    cleanup()
                    return;
                }

                fs.readdir("./", (err, files) => {
                    if (files.length != 1) {
                        cleanup()
                        return;
                    }
                    let audioFile = path.resolve(files[0])
                    response.sendFile(audioFile)
                    cleanup()
                })
            });
        } else {
            cleanup()
        }
    })
}