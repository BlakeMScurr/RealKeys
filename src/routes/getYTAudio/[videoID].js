const { exec } = require('child_process');
const fs = require("fs");
var path = require("path");

export function get(request, response) {
    const { videoID } = request.params
    fs.mkdtemp('temp-', (err, tmpdir) => {
        const cleanup = () => {fs.rmdirSync(tmpdir, { recursive: true });}
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
                })
                cleanup()
            });
        } else {
            cleanup()
        }
    })
}