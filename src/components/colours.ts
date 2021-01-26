import distinctColors from 'distinct-colors'

// TODO: do this in scss

export const niceBlue = "#38A3FA";
export const rightGreen = "#42c966"
export const wrongRed = "#eb4236"
export const expectingOrange = "#f58f00"
export const white = "#ffffff"
export const black = "#000000"
export const whiteNum = 0xffffff // TODO: only use one format, or perhaps one class with multiple formats
export const whiteRollKey = 0x8D8C8C
export const blackRollKey = 0x5A5757
export const barLineGrey = 0xAAAAAA
export const niceBlueNum = 0x38A3FA

const trackColours = [
    0x38A3FA,
    0xD55672,
    0x48D5D5,
    0x0075F2,
    0xFFFF82,
    0xDD6E42,
    0x26532B,
    0xA776A2,
    0xFFE5D4,
    0x18F500,
]

export class Colourer {
    extras
    constructor(n) {
        if (n > trackColours.length) {
            // TODO: figure out why distinctColours is imported as a library as opposed to a function in the dev server, whereas it's a function in storybook
            let dcf = distinctColors.hasOwnProperty("default") ? distinctColors.default : distinctColors
            this.extras = dcf({ count: n - trackColours.length, hueMin: 100 })
        }
    }

    trackColour(track: number) {
        if (track < 0 || track !== Math.floor(track)) {
            throw new Error("track must be a positive integer")
        }
    
        if (track < trackColours.length) {
            return trackColours[track]
        }
    
        return parseInt(this.extras[track - trackColours.length].hex().slice(1), 16) 
    }

    hex(track: number) {
        return "#" + this.trackColour(track).toString(16)
    }
}

