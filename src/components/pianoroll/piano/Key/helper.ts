import { keyState } from "../../../../lib/gameplay/score/stateTracking"
import { niceBlue, blackHighlight, white, whiteHighlight, black } from "../../../colours"

export function colour(state: keyState, isBlack: Boolean) {
    switch (state) {
        case keyState.active:
            return niceBlue
        case keyState.highlighted:
            return isBlack ? blackHighlight : whiteHighlight
        default:
            return isBlack ? black : white
    }
}