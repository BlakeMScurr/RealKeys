import { pathToAudioFile } from "../../utils/util";

const path = require('path');
export function get(request, response) {
    console.log("path:")
    console.log(path.resolve(pathToAudioFile(request.params.videoID)))
    response.sendFile(path.resolve(pathToAudioFile(request.params.videoID)))
}