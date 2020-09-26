import { calculateBars } from "../../../../backend/beatcalculation/barCalculation.js"
import { NewPool } from "../../../../backend/db/client.js"
import { downloadYouTubeVideo } from "../../../../backend/youtube-dl.js"
var prep = require('pg-prepared')

export function post(request, response) {
    const pool = NewPool()
    let params = { lessonName: request.params.owner + "/" + request.params.lessonID, notes: JSON.stringify(request.body.notes) }
    let insertion = prep('INSERT INTO roll(LESSON_NAME, NOTES) VALUES (${lessonName}, ${notes});')
    pool.query(insertion(params), (err, res) => {
        if (err !== undefined) {
            console.warn(err)
            // TODO: handle errors properly
            // throw new Error(err)
        }
    })
}