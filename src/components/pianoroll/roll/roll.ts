import { songDuration } from "../../../stores/stores";

export function zoomWidth() {
    let zoomLength = 2 * 1000 // length of the zoom window in seconds
    let duration;
    songDuration.subscribe((val)=>{
        duration = val
    })
    return zoomLength / duration;
}