import { NewPool } from "../../../../backend/db/client.js"
var prep = require('pg-prepared')

export function post(request, response) {
    const pool = NewPool()
    let uniquenessCheck = prep('SELECT * FROM lesson WHERE LESSON_OWNER=${owner} AND LESSON_NAME=${lessonID}')
    pool.query(uniquenessCheck(request.params), (err, res) => {
        if (err !== undefined) {
            throw err
        }
        if (res.rows.length != 0) {
            console.log("already exists")
            response.status(400).send({
                message: "Lesson \"" + request.params.owner + "/" + request.params.lessonID + "\" already exists"
            })
        } else {
            console.log("doesn't exist yet")
            // TODO: calculate barlines

            let insertion = prep('INSERT INTO lesson(LESSON_OWNER, LESSON_NAME, YOUTUBE_ID, YOUTUBE_TITLE) VALUES (${owner}, ${lessonName}, ${youtubeID}, ${youtubeTitle})')
            pool.query(insertion(request.body), (err, res) => {
                if (err !== undefined) {
                    throw err
                }
                pool.end()
                response.end()
            })
        }
    })
}
