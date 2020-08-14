const fetch = require('node-fetch');

export function post(req, res) {
    console.log("got title request with url" + req.body.videoID)
    
    var options = {
        host: "www.youtube.com",
        path: "" + req.body.videoID,
    }

    let title;
    fetch('http://www.youtube.com/oembed?url=http://www.youtube.com/watch?v='+req.body.videoID+'&format=json')
        .then(res => res.json())
        .then(json => res.json({title: json.title}));    
}