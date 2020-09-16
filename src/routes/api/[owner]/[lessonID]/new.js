import { NewPool } from "../../../../backend/db/client.js"
var prep = require('pg-prepared')

export function post(request, response) {
    console.log("inserting")
    const pool = NewPool()
    let query = prep('INSERT INTO lesson(LESSON_OWNER, LESSON_NAME, YOUTUBE_ID, YOUTUBE_TITLE) VALUES (${owner}, ${lessonName}, ${youtubeID}, ${youtubeTitle})')
    pool.query(query(request.body), (err, res) => {
        // TODO: return error
        pool.end()
        response.end()
    })
}
