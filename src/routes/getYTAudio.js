const { exec } = require('child_process');
const fs = require("fs");
var path = require("path");

export function post(request, response) {
    console.log("getting audio request for: " + request.body.videoID)

    fs.mkdtemp('temp-', (err, tmpdir) => {
        const cleanup = () => {fs.rmdirSync(tmpdir, { recursive: true });}
        if (fs.existsSync(tmpdir)) {
            process.chdir(tmpdir)

            exec('youtube-dl -x https://www.youtube.com/watch?v=' + request.body.videoID, (err, stdout, stderr) => {
                if (err) {
                    // node couldn't execute the command
                    console.log("could not download audio: " + err)
                    cleanup()
                    return;
                }

                console.log("reading dirs")
                fs.readdir("./", (err, files) => {
                    console.log("reading file")
                    if (files.length != 1) {
                        console.log("wrong number of files in temporary directory: " + files.length)
                        cleanup()
                        return;
                    }
                    let audioFile = path.resolve(files[0])
                    response.sendFile(audioFile)
                })
                cleanup()
            });
        } else {
            console.log("path " + tmpdir + " doesn't exist")
            cleanup()
        }
    })

}