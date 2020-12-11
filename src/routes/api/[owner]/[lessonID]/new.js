import { NewPool } from "../../../../backend/db/client.js"
var prep = require('pg-prepared')

export function post(request, response) {
    const pool = NewPool()

    // ensure lesson is unique
    let params = {lessonID: request.params.owner + "/" + request.params.lessonID}
    let uniquenessCheck = prep('SELECT * FROM lesson WHERE LESSON_NAME=${lessonID}')
    pool.query(uniquenessCheck(params), (err, res) => {
        if (err !== undefined) {
            throw err
        }
        if (res.rows.length != 0) {
            response.status(400).send({
                message: "Lesson \"" + request.params.owner + "/" + request.params.lessonID + "\" already exists"
            })
        } else {
            // TODO: Calculate barlines (could revive old bar calculation code)
            console.log(request.body)
            let insertion = prep('INSERT INTO lesson(LESSON_NAME, ARTIST, SPOTIFY_ID, BARS) VALUES (${lessonName}, ${artist}, ${spotifyID}, ${bars})')
            request.body.bars = JSON.stringify([{type: "s", width: 1}, {type: "e", width: 0}])
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
