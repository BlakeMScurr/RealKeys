import { spotifyRedirectURI, spotifyAuthorization } from "../../lib/util"
const fetch = require("node-fetch");
const request = require("request");
var FormData = require('form-data');

export function post(req, res) {
    let { code } = req.body;

    var postQuery = 'grant_type=authorization_code&code='+code+"&redirect_uri="+spotifyRedirectURI();

    fetch("https://accounts.spotify.com/api/token", {
        method: "POST",
        headers: {
            'Authorization': spotifyAuthorization(),
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': postQuery.length
        },
        body: postQuery,
    }).then(res => {
        return res.json()
    }).then(json => {
        console.log(json)
    }).catch((e)=>{
        console.log("failure", e)
    })
}