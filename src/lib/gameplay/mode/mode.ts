export interface playbackMode {
    modeName():string // The defining characteristic of a playbackMode
    toString():string // Identical to modeName, but used as a utility method, in particular to let a task be easily serialisable
}

export enum modeName {
    atSpeed = "atSpeed",
    wait = "wait",
}

export function makeMode(mode: string):playbackMode {
    if (mode.includes(modeName.atSpeed)) {
        return new atSpeedMode(parseInt(mode.replace(modeName.atSpeed, "")))
    } else if (mode === modeName.wait) {
        return new waitMode()
    }
}

export function modeFactory(name: modeName, speed?: number):playbackMode {
    switch(name) {
        case modeName.atSpeed:
            return new atSpeedMode(speed)
        case modeName.wait:
            return new waitMode()
    }
}

// TODO: can I overload the >= operator to call this function?
export function modeEqualOrHarder(a: playbackMode, b: playbackMode) {
    return (a.modeName() === b.modeName())||
        (a.modeName().includes(modeName.atSpeed) && b.modeName() === modeName.wait) ||
        (a.modeName().includes(modeName.atSpeed) && b.modeName().includes(modeName.atSpeed) && (<atSpeedMode>a).getSpeed() >= (<atSpeedMode>b).getSpeed())
}

class atSpeedMode {
    private speed: number;
    constructor(speed?: number) {
        if (!speed) speed = 100
        if (speed <= 0) throw new Error(`Speeds cannot be less than or equal to zero, got ${speed}`) // This one is logically impossible - it would result in going backwards
        if (speed > 200) throw new Error(`Speeds should not be played at greater than twice the song's expected speed, got ${speed}`) // This is a sanity check, as (I believe) there's no reasonable reason to go faster than this
        this.speed = speed
    }

    modeName():string {
        return modeName.atSpeed + this.getSpeed()
    }

    toString():string {
        return this.modeName()
    }

    getSpeed():number {
        return this.speed
    }
}

class waitMode {
    modeName():string {
        return modeName.wait
    }

    toString():string {
        return this.modeName()
    }
}