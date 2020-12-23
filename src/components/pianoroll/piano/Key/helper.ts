import { niceBlue, rightGreen, white, wrongRed, black, expectingOrange } from "../../../colours"

export function colour(state: string, isBlack: Boolean) {
    switch (state) {
        case 'active':
            return niceBlue
        case 'right':
            return rightGreen
        case 'wrong':
            return wrongRed
        case 'expecting':
            return expectingOrange
        default:
            return isBlack ? black : white
    }
}