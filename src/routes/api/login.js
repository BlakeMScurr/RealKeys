import { spotifyRedirectURI, spotifyAuthorization } from "../../lib/util"
const fetch = require("node-fetch");
const jwt = require("jsonwebtoken");

function generateAccessToken(userID, username, spotifyToken) {
    // expires after half and hour (1800 seconds = 30 minutes)
    return jwt.sign({'userID': userID, 'username': username, 'spotifyToken': spotifyToken}, process.env.TOKEN_SECRET, { expiresIn: '1800s' });
}

export function post(req, responder) {
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
        if (json.error !== undefined) {
            responder.status(400).json({'error':json.error})
        } else {
            // TODO: use token refreshing
            let { access_token, token_type, expires_in, refresh_token, scope } = json
            fetch("https://api.spotify.com/v1/me", {
                method: "GET",
                headers: {
                    'Accept': "application/json",
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + access_token,
                }
            }).then((res)=> {
                return res.json()
            }).then((json)=>{
                let { display_name, id } = json
                // TODO: show username rather than display name
                let webtoken = generateAccessToken(id, display_name, access_token)
                responder.json({'jwt': webtoken, 'spotifyAccessToken': access_token})
            }).catch((e)=>{
                console.log("failed to get spotify id", e)
            })
        }
    }).catch((e)=>{
        console.log("failed to get token", e)
    })
}