import { spotifyRedirectURI, spotifyAuthorization } from "../../lib/util"
const fetch = require("node-fetch");
var FormData = require('form-data');

export function post(request, response) {
    let { code } = request.body;
    console.log(code)
    fetch("https://accounts.spotify.com/api/token", {
        method: "POST",
        headers: {
            'Authorization': spotifyAuthorization(),
            'Content-Type':'application/x-www-form-urlencoded; charset=UTF-8',
            // 'Content-Type':'application/json',
        },
        body: new FormData({
            grant_type: "authorization_code",
            code: code,
            redirect_uri: spotifyRedirectURI(),
        })
    }).then(res => {
        console.log(res)
    }).catch((e)=>{
        console.log("failure", e)
    })
}