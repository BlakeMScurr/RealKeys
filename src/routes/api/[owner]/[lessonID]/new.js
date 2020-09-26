import { calculateBars } from "../../../../backend/beatcalculation/barCalculation.js"
import { NewPool } from "../../../../backend/db/client.js"
import { downloadYouTubeVideo } from "../../../../backend/youtube-dl.js"
var prep = require('pg-prepared')

export function post(request, response) {
    console.log("running new")
    const pool = NewPool()

    // ensure lesson is unique
    let params = {lessonID: request.params.owner + "/" + request.params.lessonID}
    let uniquenessCheck = prep('SELECT * FROM lesson WHERE LESSON_NAME=${lessonID}')
    pool.query(uniquenessCheck(params), (err, res) => {
        if (err !== undefined) {
            throw err
        }
        if (res.rows.length != 0) {
            console.log("already exists")
            response.status(400).send({
                message: "Lesson \"" + request.params.owner + "/" + request.params.lessonID + "\" already exists"
            })
        } else {
            // Download audio if it doesn't already exist
            downloadYouTubeVideo(request.body.youtubeID)

            // Calculate barlines
            calculateBars(request.body.youtubeID).then((bars)=>{
                let insertion = prep('INSERT INTO lesson(LESSON_NAME, YOUTUBE_ID, YOUTUBE_TITLE, BARS) VALUES (${lessonName}, ${youtubeID}, ${youtubeTitle}, ${bars})')
                request.body.bars = JSON.stringify(bars)
                pool.query(insertion(request.body), (err, res) => {
                    if (err !== undefined) {
                        throw err
                    }
                    pool.end()
                    response.end()
                })
            })
        }
    })
}
