import { calculateBars } from "../../../../backend/beatcalculation/barCalculation.js"
import { NewPool } from "../../../../backend/db/client.js"
import { downloadYouTubeVideo } from "../../../../backend/youtube-dl.js"
var prep = require('pg-prepared')

export function post(request, response) {

    console.log("running updateNotes")
    console.log("body")
    console.log(request.body)
    console.log("params")
    console.log(request.params)
    const pool = NewPool()
    console.log(request.params)

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