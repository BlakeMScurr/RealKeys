import { calculateBars } from "../../../../backend/beatcalculation/barCalculation.js"
import { NewPool } from "../../../../backend/db/client.js"
import { downloadYouTubeVideo } from "../../../../backend/youtube-dl.js"
var prep = require('pg-prepared')

export function post(request, response) {
    console.log("running new")
    const pool = NewPool()
    console.log(request.params)
}