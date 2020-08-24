const fetch = require('node-fetch');

export function post(req, res) {
    const { videoID } = req.params;

    if (videoID.startsWith("testdata-")) {
        res.json({title: "test title"})
        return
    }

    var options = {
        host: "www.youtube.com",
        path: "" + videoID,
    }

    fetch('http://www.youtube.com/oembed?url=http://www.youtube.com/watch?v='+videoID+'&format=json')
        .then(res => res.json())
        .then(json => res.json({title: json.title}))
        .catch(error => res.status(400).send('Could not find video title'))
}