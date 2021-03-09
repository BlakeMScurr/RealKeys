export interface playbackMode {
    modeType():modeName
    getSpeed():number
    toString():string // for serialisation, particularly in URLs
    description():string
}

export enum modeName {
    atSpeed = "atSpeed",
    wait = "wait",
    play = "play",
    pause = "pause",
}

export function makeMode(mode: string):playbackMode {
    if (mode && mode.includes(modeName.atSpeed)) {
        return new atSpeedMode(parseInt(mode.replace(modeName.atSpeed, "")))
    }
    if (typeof modeName[mode] === "undefined") throw new Error(`unknown mode type ${mode}`)
    return modeFactory(<modeName>mode)
}

export function modeFactory(name: modeName, speed?: number):playbackMode {
    switch(name) {
        case modeName.atSpeed:
            return new atSpeedMode(speed)
        case modeName.wait:
            return new waitMode()
        case modeName.play:
            return new playMode()
        case modeName.pause:
            return new pauseMode()
    }
}

// TODO: can I made these methods on playback mode without redundantly adding it to every single class?
// TODO: can I overload the >= operator to call this function?
export function modeEqualOrHarder(a: playbackMode, b: playbackMode) {
    return (a.modeType() === b.modeType() && a.getSpeed() >= b.getSpeed()) || (a.modeType() === modeName.atSpeed && b.modeType() === modeName.wait)
}

export function equalModes(m: playbackMode, n: playbackMode): boolean {
    return  m.modeType() === n.modeType() && m.getSpeed() === n.getSpeed()
}

class atSpeedMode {
    private speed: number;
    constructor(speed?: number) {
        if (!speed) speed = 100
        if (speed <= 0) throw new Error(`Speeds cannot be less than or equal to zero, got ${speed}`) // This one is logically impossible - it would result in going backwards
        if (speed > 200) throw new Error(`Speeds should not be played at greater than twice the song's expected speed, got ${speed}`) // This is a sanity check, as (I believe) there's no reasonable reason to go faster than this
        this.speed = speed
    }

    modeType():modeName {
        return modeName.atSpeed
    }

    getSpeed():number {
        return this.speed
    }

    toString():string {
        return "atSpeed" + this.getSpeed()
    }

    description():string {
        return `At ${this.getSpeed()}% speed`
    }
}

class waitMode {
    modeType():modeName { return modeName.wait }
    getSpeed():number { return 0 }
    toString():string { return "wait" }
    description():string { return "At your own pace" }
}

class playMode {
    modeType():modeName { return modeName.play }
    getSpeed():number { return 0 }
    toString():string { return "play" }
    description():string { return "Just listen" }
}
class pauseMode {
    modeType():modeName { return modeName.pause }
    getSpeed():number { return 0 }
    toString():string { return "pause" }
    description():string { return "The music's paused, so absorb the info" }
}