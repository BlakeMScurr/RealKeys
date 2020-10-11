export function getPlayer(token) {
    const player = new Spotify.Player({
        name: 'RealKeys Spotify Player',
        getOAuthToken: cb => { cb(token); }
    });
    
    // Error handling
    player.addListener('initialization_error', ({ message }) => { console.error(message); });
    // TODO: find proper scope to request for this
    // player.addListener('authentication_error', ({ message }) => { console.error(message); });
    player.addListener('account_error', ({ message }) => { console.error(message); });
    player.addListener('playback_error', ({ message }) => { console.error(message); });
    
    // Playback status updates
    player.addListener('player_state_changed', state => { 
        // console.log(state);
    });
    
    // Ready
    player.addListener('ready', ({ device_id }) => {
        console.log('Ready with Device ID', device_id);
    });
    
    // Not Ready
    player.addListener('not_ready', ({ device_id }) => {
        console.log('Device ID has gone offline', device_id);
    });
    
    // Connect to the player!
    player.connect();
    return player
}

export function play(trackID: string, player: any) {
    playinternal({
        playerInstance: player,
        spotify_uri: "spotify:track:" + trackID,
    })
}

// directly copied from https://developer.spotify.com/documentation/web-playback-sdk/reference/#playing-a-spotify-uri
const playinternal = ({
    spotify_uri,
    playerInstance: {
        _options: {
        getOAuthToken,
        id
        }
    }
}) => {
    getOAuthToken(access_token => {
        fetch(`https://api.spotify.com/v1/me/player/play?device_id=${id}`, {
        method: 'PUT',
        body: JSON.stringify({ uris: [spotify_uri] }),
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${access_token}`
        },
        });
    });
};
  
