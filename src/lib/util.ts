import type { Readable } from "svelte/store"

// This should be called in every onmount function
export function handleErrors(window: Window & typeof globalThis) {
    window.onerror = (e: PromiseRejectionEvent) => {
        postError(e)
    }

    window.onunhandledrejection = (e: PromiseRejectionEvent) => {
        postError(e)
    }
}

function postError(e: PromiseRejectionEvent) {
    fetch("api/reportError", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({message: e.reason.message})
    })
}

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

export function objToURLArgs(x) {
    return Object.entries(x).map((a)=>{return a[0] + "=" + a[1]}).join("&")
}

// https://stackoverflow.com/a/9039885
export function iOS() {
    return [
      'iPad Simulator',
      'iPhone Simulator',
      'iPod Simulator',
      'iPad',
      'iPhone',
      'iPod'
    ].includes(navigator.platform)
    // iPad on iOS 13 detection
    || (navigator.userAgent.includes("Mac") && "ontouchend" in document)
  }