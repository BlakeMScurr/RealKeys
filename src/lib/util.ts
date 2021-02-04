import type { Readable } from "svelte/store"

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
    if (process.env.NODE_ENV === 'development') {
        console.log("is dev")
        return 'http://localhost:3000/callback'
    }
    console.log("not dev")
    return 'https://realkeys.co/callback'
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

// gives a unique key for a map
export function uniqueKey(m, k) {
    return uniqueKeyPriv(m, k, 0)
}

function uniqueKeyPriv(m, k, n) {
    if (!m.has(k)) {
        return k
    }
    if (!m.has(k + " " + n)) {
        return k + " " + n
    }
    if (n > 100) {
        throw new Error("woah, the recursion has gone crazy there buddy, stop")
    }
    return uniqueKeyPriv(m, k, n + 1)
}

export const midiLocation = "./assets/midi/files/"

export function midiPathToName(path: string):string {
    path = path.substring(path.lastIndexOf("/") + 1)
    path = path.substring(0, path.indexOf(".mid"))
    path = path.replace(/_/g, " ")
    path = path.replace("-", " - ")
    path = path.replace(/\b\w/g, l => l.toUpperCase()) // capitalise per https://stackoverflow.com/a/38530325
    path = path.replace(/([a-zA-Z])([A-Z])/g, "$1 $2") // add camelcase spaces

    return path
}

let globalKeysEnabled = true
export function disableGlobalKeys() {
    globalKeysEnabled = false
}

export function enableGlobalKeys() {
    globalKeysEnabled = true
}

// TODO: find proper type for callback function
export function addGlobalKeyListener(down: boolean, callback: any) { 
    const listenFor = down ? "keydown" : "keyup"
    document.addEventListener(listenFor, (event) => {
        if (globalKeysEnabled) {
            callback(event)
        }
    })
}

export const separator = "%2F" // this is an alternative to / that doesn't exist in any of the paths in the midi library and shows up in the url

// TODO: use this everywhere the boilerplate is used to make sure we don't waste memory
// TODO: make sure store has subscribe function
// gets the value of a store and calls the unsubscriber to prevent memory leaks
export function get<T>(store: Readable<T>):T {
    let val
    store.subscribe((innerVal) => {
        val = innerVal
    })()
    return val
}

// from https://stackoverflow.com/a/16436975
export function arraysEqual(a, b) {
    if (a === b) return true;
    if (a == null || b == null) return false;
    if (a.length !== b.length) return false;

    for (var i = 0; i < a.length; ++i) {
      if (a[i] !== b[i]) return false;
    }
    return true;
  }

export function OneTo100(num: number) {
    if (num < 0) num = 0
    if (num > 100) num = 100
    return Math.floor(num)
}