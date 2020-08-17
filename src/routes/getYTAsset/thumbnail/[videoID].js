const fetch = require('node-fetch');

export function post(req, res) {
    const { videoID } = req.params;

    var options = {
        host: "www.youtube.com",
        path: "" + videoID,
    }

    fetch('http://img.youtube.com/vi/'+videoID+'/1.jpg')
        .then(res => res.buffer())
        .then(image => {
            res.writeHead(200, {'Content-Type': 'image/jpeg'});
            res.end(image);
        })
        .catch(error => res.status(400).send('Could not find video thumbnail'))
}