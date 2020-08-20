import { downloadYouTubeVideo } from "../../backend/youtube-dl.js";

export function get(request, response) {
    const { videoID } = request.params;
    let { cleanup, audioFile } = downloadYouTubeVideo(videoID)
    response.sendFile(audioFile)
    cleanup()
}