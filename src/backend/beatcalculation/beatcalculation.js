// Given a set of loud pulses from a piece of music, and an estimate of its bpm
// TODO: look into altering bpm_detection.py so as to avoid separately getting the pulses
export function calculateBeats(pulses, bpm) {
    let errorSums = []
    let beatLength = 60 / bpm

    // loop over each pulse
    for (let i = 0; i < pulses.length; i++) {
        const pulse = pulses[i];
        // compare it to every other pulse
        errorSums.push(0)
        for (let j = 0; j < pulses.length; j++) {
            // find the difference between the second pulse and what we'd expect given the first pulse
            const comparedPulse = pulses[j];
            let ev = errorValue(pulse, comparedPulse, beatLength)
            // add that error value to the sums
            errorSums[i] += ev
        }
    }

    // choose the lowest summed difference as the real beat
    let lowestIndex = 0
    let lowestEV = errorSums[0]
    for (let i = 1; i < errorSums.length; i++) {
        const ev = errorSums[i];
        if (ev < lowestEV) {
            lowestEV = ev
            lowestIndex = i
        }
    }
    
    // generate beats from list
    return generateBeats(pulses[lowestIndex], pulses[pulses.length-1], beatLength)
}

// generate beats creates a list of beats based around an anchor pulse and a beat length
// no beats should be after the final pulse
export function generateBeats(anchor, final, beatLength) {
    // move anchor to the start of the song
    while (anchor - beatLength >= 0) {
        anchor -= beatLength
    }

    if (beatLength <= 0) {
        throw new Error("invalid beat length " + beatLength)
    }

    let beats = []
    for (let beat = anchor; beat <= final; beat += beatLength) {
        beats.push(beat)
    }
    return beats
}

// errorValue tells us how close pulseA and pulseB are to fitting within
// a tempo within a given bpm
export function errorValue(lower, higher, beatLength) {
    // get higher/lower correct
    if (higher < lower) {
        let temp = lower
        lower = higher
        higher = temp
    }

    // remove beat lenght differences
    higher = impliedBeat(lower, higher, beatLength)
    
    // give lesser of differences implied by either side of the bar line
    let lowerError = round((lower + beatLength) - higher)
    let upperError = round(higher - lower)
    return lowerError < upperError ? lowerError : upperError
}

// implied beat takes pulls the higher beat back by increments of beatlength unless it is less
// than one beat length above lower
export function impliedBeat(lower, higher, beatLength) {
    // TODO: more elegant modular arithmetic etc
    while (higher - beatLength >= lower) {
        higher -= beatLength
    }
    return higher
}

const precision = 100000000
function round(num) {
    return Math.round(num * precision)/precision
}