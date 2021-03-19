import { keyState } from "../../../../lib/gameplay/score/stateTracking"
import { niceBlue, rightGreen, white, wrongRed, black, expectingOrange } from "../../../colours"

export function colour(state: keyState, isBlack: Boolean) {
    switch (state) {
        case keyState.active:
            return niceBlue
        case keyState.right:
            return rightGreen
        case keyState.wrong:
            return wrongRed
        case keyState.expecting:
            return expectingOrange
        default:
            return isBlack ? black : white
    }
}