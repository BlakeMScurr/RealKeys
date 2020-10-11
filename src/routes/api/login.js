import { spotifyRedirectURI, spotifyAuthorization } from "../../lib/util"
const fetch = require("node-fetch");
const request = require("request");
var FormData = require('form-data');

export function post(req, res) {
    let { code } = req.body;
    console.log(code)

    var postQuery = 'grant_type=authorization_code&code='+code+"&redirect_uri="+spotifyRedirectURI();
    request({
        url: "https://accounts.spotify.com/api/token",
        method: "POST",
        headers: {
          'Authorization': spotifyAuthorization(),
          'Content-Type': 'application/x-www-form-urlencoded',
          'Content-Length': postQuery.length
        },
        body: postQuery
      }, function (error, response, data){
        //send the access token back to client
        res.end(data);
      });    


    // fetch("https://accounts.spotify.com/api/token", {
    //     method: "POST",
    //     headers: {
    //         'Authorization': spotifyAuthorization(),
    //         'Content-Type':'application/x-www-form-urlencoded; charset=UTF-8',
    //         'Content-Length': postQuery.length,
    //     },
    //     body: postQuery,
    // }).then(res => {
    //     console.log(res)
    // }).catch((e)=>{
    //     console.log("failure", e)
    // })
}