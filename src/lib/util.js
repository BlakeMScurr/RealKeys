export function strip(number) { // fixing some floating point arithmetic problems
    const bigNum = 1000000
    return Math.round(number*bigNum)/bigNum
}

// TODO: move onto type
export function widthSum(bars) {
    return bars.reduce((acc, curr) => { return acc + curr.width }, 0)
}

export function pathToAudioFile(ytID) {
    return "./src/backend/db/audioFiles/" + ytID + ".mp3"
}

export class MockFetcher {
    constructor(routes) {
        this.routes = routes
    }

    async fetch(method, url) {
        // TODO: use an efficient lookup (who really cares though?)
        for (let i = 0; i < this.routes.length; i++) {
            const route = this.routes[i];
            if (method == route.method && url == route.url) {
                return route.result
            }
        }
    }
}

export class Fetcher {
    async fetch(method, url, body) {
        let response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(body),
        })

        if (method != "POST") {
            const json = await response.json()
            return json
        }
    }
}

export function renderSeconds(seconds) {
    seconds = seconds.toFixed(1)
    if (seconds < 60) {
        return seconds.toString()
    }

    let minutes = Math.floor(seconds / 60)
    seconds = seconds % 60
    if (minutes < 60) {
        return minutes.toFixed(0) + ":" + seconds.toFixed(1)
    }

    let hours = Math.floor(minutes / 60)
    minutes = minutes % 60
    return hours.toFixed(0) + ":" + minutes.toFixed(0) + ":" + seconds.toFixed(1)
}

export function joinURL(parts){
    // Requires trailing slash or else chrome will lowercase the url - fuck you chrome
    return parts.join("/") + "/"
}

export function spotifyRedirectURI() {
    // TODO: check process.env.NODE_ENV
    return 'http://localhost:3000/callback'
    // var redirect_uri = 'http://realkeys.co/callback'
}

export function getCookie(name, jar) {
    const value = `; ${jar}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}

export function removeCookie(name, jar) {
    const cookie = getCookie(name, jar)
    return jar.replace(name, "")
}