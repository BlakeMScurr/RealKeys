import { pathToAudioFile } from "../../lib/util";

const path = require('path');
export function get(request, response) {
    response.sendFile(path.resolve(pathToAudioFile(request.params.videoID)))
}